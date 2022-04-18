// import 'react-app-polyfill/ie11';
// import { FC, ReducerState } from '../node_modules/react';
// // import ReactDOM from '../node_modules/react-dom';
// import * as React from '../node_modules/react';
// import * as ReactDOM from '../node_modules/react-dom';
import Store, {ReducerPiece, useElf, useElfSubscribe, getElfDispatch, getElfState, Action} from '../.';
import reducers from "./reducer";
import {FC, ReducerState, useState} from 'react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

const Count: FC = () => {
    const [[count]] = useElfSubscribe('example', 'count');

    return (
        <div>{count}</div>
    );
}

const NoSubscribeData: FC = () => {
    const update = useState(0)[1];
    const {count} = getElfState('example');

    return (
        <div>
            <span>这里的数据并不会动态更新：</span>
            {count}
            <button style={{margin: 20}} onClick={() => update(Math.random())}>更新</button>
        </div>
    );
}

const Increace: FC = ({children}) => {
    const dispatch = getElfDispatch('example');

    function onIncrease() {
        const state = getElfState('example');
        console.log('当前状态对象::', state);
        dispatch('increase', state.count + 1)
    }

    return <button onClick={onIncrease}>
        {children}
    </button>
}


const Decreace: FC = ({children}) => {
    // const dispatch = getElfDispatch('example');
    const [{count}, dispatch] = useElf('example');

    function onIncrease() {
        dispatch('increase', count - 1)
    }

    return <button style={{margin: 20}} onClick={onIncrease}>
        {children}
    </button>
}


const Test: FC = ({children}) => {
    // const dispatch = getElfDispatch('example');
    const [exampleState, dispatch] = useElf('example');

    function onClick() {
        exampleState.count = '200Test';

        dispatch('updateTest', 'update');
    }

    return <button style={{margin: 20}} onClick={onClick}>
        {children}
        {`${JSON.stringify(exampleState)}`}
    </button>
};


const App: FC = () => {
    return (
        <div>
            <Store reducers={reducers}/>
            <div>Hello react-elf</div>
            <Count/>
            <Increace> + </Increace>
            <Decreace> - </Decreace>

            <NoSubscribeData/>
            <Test>测试原数据的改动</Test>
        </div>
    );
};

ReactDOM.render(<App/>, document.getElementById('root'));


export default App;
