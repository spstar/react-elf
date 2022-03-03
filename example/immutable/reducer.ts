import {Action, ReducerPiece} from "../../dist";
import {Map, Record} from 'immutable';


interface StateType {
    name: string;
    count: number;
    complexData: Map<string, any>
}

function reducer(state: Record<StateType>, action: Action) {
    switch (action.type) {
        case 'increase':
            return state.set('count', action.payload);

        case 'updateTest':
        /** 如果使用初始化为定义的key 这里会报错 */
        // return state.set('test', action.payload);

        case 'updateName':
            return state.set('name', action.payload);

        case 'updateComplexValue':
            return state.setIn(['complexData', 'value'], action.payload);

        case 'updateComplexKey':
            return state.setIn(['complexData', 'key'], action.payload);

        default:
            return state;
    }
}

interface StateTypeMap {
    test: string;
    list: number;
}

const MapState: Map<string, any> = Map({
    key: 'Foo',
    value: 99
});

const Init: Record.Factory<StateType> = Record({
    name: 'record-state demo',
    count: 0,
    complexData: MapState
}, 'DEMO_RECORD_STATE');

const reducers: Array<ReducerPiece> = [
    {
        reducer,
        name: 'example-m',
        init: new Init(),
        getValueFromState(state, field) {
            return state.getIn(Array.isArray(field) ? field : [field]);
        }
    },
];

export default reducers;
