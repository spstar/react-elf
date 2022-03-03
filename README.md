### react-elf

[![][bundlesize-js-image]][unpkg-js-url]

[bundlesize-js-image]: https://img.badgesize.io/https:/unpkg.com/react-elf/dist/react-elf.cjs.production.min.js?label=react%20elf.min.js&compression=gzip&style=flat
[unpkg-js-url]: https://unpkg.com/react-elf/dist/react-elf.cjs.production.min.js

### react-elf 状态管理器使用说明

该状态管理器是对react-hooks 的一种封装， 能让你像使用hooks一样的方式，来管理你项目的状态。实现同react-redux相同的功能；

    特点： 使用简单；体积小；支持Immutable数据； 支持订阅指定数据字段

#### 1. 数据注册（Store Register）
* 在`Router`节点之前注册 `Store` 这样可以保证`Store`中的数据可以用于任何位置

```js
import ReactDom from 'react-dom';
import Store from 'react-elf';
import reducer from './reducer.js';
/**
interface StoreProps {
    reducers: Array<ReducerPiece>,
    
    // getValueFromState：[v0.1.3 支持] 自定义从state中获取指定字段的值（适用于从复杂对象中获取值：如Immutable对象中取值）
    // 该方法为可选：
    // 1、在Store 属性中指定的getValueFromState 方法是用于所有状态切片的取值
    // 2、在reducer指定的getValueFromState 方法会覆盖Store中指定的取值方法；
    getValueFromState?: GetValueFromState
}

// 返回当前State 中指定字段的值
type GetValueFromState = (state: any, field: any) => any;

// 示例 Immutable 数据：
function getValueFromState(state, field) {
    return state.getIn(Array.isArray(field) ? field : [field]);
}

// usage::
const TestMapData: FC = () => {
    const [[value], dispatch] = useElfSubscribe('example-m', [['complexData', 'value']]);

    return (
        <div>
            <span>订阅的Map 数据：{value}</span>
            <button onClick={() => dispatch('updateComplexValue', Math.random())}>更新Map 数据</button>
        </div>
    );
};

*/

// 注册方式：传入一个属性 reducers: Array<ReducerPiece>
/**
interface ReducerPiece {
    reducer: Reducer<ReducerState<any>, Action>,
    name: StatePieceName,
    init: any,
    
    // 该方法会覆盖Store 中指定的getValueFromState, 可以只针对于一个数据片段指定取值方法；
    getValueFromState?: GetValueFromState, // 0.1.3 版本支持
    initializer?: (arg: any) => ReducerStateWithoutAction<ReducerWithoutAction<any>>
}
*/

const App = () => {
    return (
        <>
            <Store reducers={[reducer]} />
            <Router />
        </>
    );
};

ReactDom.render(<App />, document.getElementById('root'));

```

#### 2. 创建reducer
* reducers 只是一个存放`reducer`的数组；这里描述如何创建一个reducer:

```js
// './reducer.js'

/**
export interface Action {
    type: string;
    payload?: any;
    error?: boolean;
    meta?: any;
}
*/
function reducer(state, action) {
    switch (action.type) {
        case 'increase':
            return { ...state, count: action.payload };

        default:
            return state;
    }
}


const init = {
    name: 'D',
    count: 0
};

/**
export interface ReducerPiece {
    reducer: Reducer<ReducerState<any>, Action>;
    name: StatePieceName;
    init: any;
    initializer?: (arg: any) => ReducerStateWithoutAction<ReducerWithoutAction<any>>;
}
*/
export default {
    reducer,
    name: 'example',
    init
};

```

#### 3. 订阅数据，当数据修改时更新当前组件 (useElf 数据订阅)

```js
import {useElf} from 'react-elf'

/**
// 分发器定义
type ElfDispatch = (x: string | Action, payload?: any) => void;
*/
const Decreace = ({ children }) => {
    const [{ count }, dispatch] = useElf('example');

    function onIncrease() {
        // 更新状态的方式：传递两个参数，第一个参数是action的类型Type, 第二个参数是携带的数据；
        dispatch('increase', count - 1);
        
        // 一般用于不需要传递 payload 的情况下，更新状态的方式：传递一个action对象 [关于action的标准可以参考: https://github.com/redux-utilities/flux-standard-action]
        // dispatch({type: 'increase', payload: count - 1 });
    }

    return (
        <button style={{margin: 20}} onClick={onIncrease}>
            {children}
        </button>
    );
}
```

#### 4. 如果只想订阅某个数据片段中的一部分值

```js
import {useElfSubscribe} from 'react-elf';

// TS useElfSubscribe 描述：
// declare function useElfSubscribe(name: StatePieceName, subscribableFields: any | any[]): [any[], ElfDispatch];

const Count = () => {
    const [[count]] = useElfSubscribe('example', 'count');

    return <div>{count}</div>;
}


// 如果需要订阅多个字段，可以像下面这样传递一个数组；
// Note: useElfSubscribe 只会按顺序，返回订阅的数据，在当前数据切片中的其它数据并不会反回;
// 支持使用"name-path"
// const [[count, name, id], dispatch] = useElfSubscribe('example', ['count', 'name', 'arr[0].data.id']);
```

    注意：这里有些需要注意的问题，如果你订阅的数据是引用型变量，请确保在更新状态的时候该引用型变量的改变；（这个问题是由于在判定状态值是否改变使用的是浅比较[Object.is]）
    一般建议订阅引用型变量内部的基本类型的值；例如： `useElfSubscribe('example', ['pagination.size', 'pagination.current']) 等
    如果不方便按照此种方法订阅值的更新，建议使用 useElf 订阅数据；


#### 5. 如果，只想获取某个数据片段，并不想订阅数据更新（当订阅的数据变更时并不会通知当前组件更新）

```js
import {getElfState} from 'react-elf';

const NoSubscribeData = () => {
    const {count} = getElfState('example');

    return (
        <div>
            <span>这里的数据并不会动态更新：</span>
            <span>{count}</span>
        </div>
    );
}
```

#### 6. 如果，只想获取某个数据片段的分发器（更新某个数据片段的[dispatch]）不需要数据，也不需要订阅数据更新

```js
import {getElfDispatch} from 'react-elf';

const Increace = ({ children }) => {
    const dispatch = getElfDispatch('example');

    function onIncrease() {
        const state = getElfState('example');
        dispatch('increase', state.count + 1)
    }

    return (
        <button onClick={onIncrease}>
            {children}
        </button>
    );
}
```
