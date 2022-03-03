import React, {
    useMemo,
    useEffect,
    useReducer,
    useCallback,
    useState,
    FC,
    Dispatch,
    ReducerState,
    Reducer,
    ReducerStateWithoutAction,
    ReducerWithoutAction, ReactElement
} from 'react';
import {getValue as _get} from './utils';

/** 状态切片的名称暂定为string 类型，事实上可以支持所有Map对象支持的类型；*/
export type StatePieceName = string;

/** ElfDispatch 相比与 Dispatch 支持接收两个参数，即：Action.type，Action.payload; 同时也支持分发Action对象 */
export type ElfDispatch = (x: string | Action, payload?: any) => void;

// 自定义从state中取值的方法
export type GetValueFromState = (state: any, field: any) => any;

export interface Action {
    type: string,
    payload?: any,
    error?: boolean,
    meta?: any
}

export interface ReducerPiece {
    reducer: Reducer<ReducerState<any>, Action>,
    name: StatePieceName,
    init: any,
    initializer?: (arg: any) => ReducerStateWithoutAction<ReducerWithoutAction<any>>,
    getValueFromState?: GetValueFromState
}

export interface StoreProps {
    reducers: Array<ReducerPiece>,
    getValueFromState?: GetValueFromState
}

/** all state piece dispatch container */
let DispatchMap: Map<StatePieceName, ElfDispatch> = new Map();

/** all state lib container */
let StateLibMap: Map<StatePieceName, ReducerState<any>> = new Map();

/** 使用切片内数据订阅，保存前一次订阅状态的值 */
let PrevStateMap: Map<StatePieceName, Map<Dispatch<any>, Array<any>>> = new Map();

/** 使用切片内数据订阅，记录当前组件订阅的字段 */
let CmpSubscribedFieldsMap: Map<StatePieceName, Map<Dispatch<any>, Array<any>>> = new Map();

/** 订阅状态更新的组件，当状态更改了触发订阅组件状态更新的hook函数 */
let SubscribedDispatchChainMap: Map<StatePieceName, Set<Dispatch<any>>> = new Map();

/**
 * User defined get value method map;
 */
let GetValueMethodMap: Map<StatePieceName, GetValueFromState> = new Map();

let defaultGetValue = _get;

const noopElfDispatch: ElfDispatch = () => undefined;

// /** Store 注册器 */
export default function Store({reducers, getValueFromState}: StoreProps): ReactElement {
    defaultGetValue = getValueFromState || defaultGetValue;

    return <>{reducers.map((it) => <StatePiece key={it.name} {...it} />)}</>;
}

/** 订阅StateLibMap 中指定切片内的所有数据的变更 */
export function useElf(name: StatePieceName): [any, ElfDispatch] {
    useSubscribe(name);

    return [getElfState(name), getElfDispatch(name)];
}

/**
 * 相比与 useElf 支持订阅片段内指定字段的数据状态的变更；
 * 注意：
 * 1、该方法只返回订阅的数据，返回值数组中的第一个始终是一个数组（不管你传递的订阅是单个值还是多个值），该数组保存指定订阅的数据值；
 * 2、订阅的数据支持深度访问路径(path-name)`如：'a.b[1].c'`
 */
export function useElfSubscribe(name: StatePieceName, subscribableFields: any | any[]): [any[], ElfDispatch] {
    const subscribableDispatch = useSubscribe(name);
    const fields = [].concat(subscribableFields);

    useMemo(
        function () {
            CmpSubscribedFieldsMap.get(name)?.set(subscribableDispatch, fields);
        },
        [name]
    );

    return [
        getPreciseState(name, getElfState(name), fields),
        getElfDispatch(name)
    ];
}

/** 只获取 name 指定的状态切片的数据，不做订阅和分发 */
export function getElfState(name: StatePieceName): any {
    return StateLibMap.get(name);
}

/** 只订阅状态分发，不需要订阅状态更新（即数据的更改不会通知当前组件更新）*/
export function getElfDispatch(name: StatePieceName): ElfDispatch {
    return DispatchMap.get(name) || noopElfDispatch;
}

const StatePiece: FC<ReducerPiece> = ({name, reducer, init, initializer, getValueFromState}) => {
    let [state, dispatch] = useReducer(reducer, init, initializer as undefined);

    useMemo(() => {
        PrevStateMap.set(name, new Map());
        CmpSubscribedFieldsMap.set(name, new Map());
        SubscribedDispatchChainMap.set(name, new Set());
        GetValueMethodMap.set(name, getValueFromState || defaultGetValue);
    }, [name]);

    useEffect(() => {
        // 注意：这里的状态分发需要放入useEffect中，如果放到外面，那么当前组件更新的时候触发其它组件状态更新会导致数据状态混乱
        SubscribedDispatchChainMap.get(name)?.forEach((subDispatch) => {
            const subscribableFields = CmpSubscribedFieldsMap.get(name)?.get(subDispatch);

            if (subscribableFields) {
                subscribableFields.some((field, idx) => {
                    const isSame = Object.is(
                        _get(PrevStateMap.get(name)?.get(subDispatch), idx),
                        (GetValueMethodMap.get(name) as GetValueFromState)(state, field)
                    );

                    if (isSame) {
                        return false;
                    }

                    subDispatch(state);
                    return true;
                });

                // 更新当前状态，保存为前一个状态；
                PrevStateMap.get(name)?.set(
                    subDispatch,
                    getPreciseState(name, state, subscribableFields)
                );
            } else {
                subDispatch(state);
            }
        });
    }, [state, name]);

    const elfDispatch: ElfDispatch = useCallback((x, payload) => {
        return dispatch(typeof x === 'string' ? {type: x, payload} : x);
    }, [dispatch]);

    // 注意：下一行放到useEffect 中是不合理的，数据的使用早于Effect中的赋值
    StateLibMap.set(name, state);
    DispatchMap.set(name, elfDispatch);

    return null;
};

function useSubscribe(name: StatePieceName): Dispatch<any> {
    const subscribableDispatch = useState(null)[1];

    useEffect(function () {
        SubscribedDispatchChainMap.get(name)?.add(subscribableDispatch);

        return () => {
            // 删除保存的前一个状态对象
            PrevStateMap.get(name)?.delete(subscribableDispatch);
            // 删除当前组件订阅字段对象；
            CmpSubscribedFieldsMap.get(name)?.delete(subscribableDispatch);
            // 删除订阅
            SubscribedDispatchChainMap.get(name)?.delete(subscribableDispatch);
        };
    }, [subscribableDispatch]);

    return subscribableDispatch;
}

/** 接收状态对象，和一组名称数组，按序返回状态对象中对应字段值的数组 */
function getPreciseState(name: StatePieceName, state: ReducerState<any>, fields: Array<any>) {
    return fields.map((field) => (GetValueMethodMap.get(name) as GetValueFromState)(state, field));
}
