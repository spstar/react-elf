import 'react-app-polyfill/ie11';
// import { FC, ReducerState } from '../node_modules/react';
// // import ReactDOM from '../node_modules/react-dom';
// import * as React from '../node_modules/react';
// import * as ReactDOM from '../node_modules/react-dom';
import Store, { ReducerPiece, useElf, useElfSubscribe, getElfDispatch, getElfState, Action } from '../.';

import { FC, ReducerState, useState } from 'react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

interface StateType {
    name: string,
    count: number
}

function reducer(state: StateType, action: Action) {
    switch (action.type) {
        case 'increase':
            return { ...state, count: action.payload };

        default:
            return state;
    }
}


const init: StateType = {
    name: 'demo-name',
    count: 0
};

const reducers: Array<ReducerPiece> = [{
    reducer,
    name: 'example',
    init
}];



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

const Increace: FC = ({ children }) => {
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


const Decreace: FC = ({ children }) => {
    // const dispatch = getElfDispatch('example');
    const [{ count }, dispatch] = useElf('example');

    function onIncrease() {
        dispatch('increase', count - 1)
    }

    return <button style={{margin: 20}} onClick={onIncrease}>
        {children}
    </button>
}


const App: FC = () => {
    return (
        <div>
            <Store key={1} reducers={reducers} />
            <div>Hello react-elf</div>
            <Count />
            <Increace> + </Increace>
            <Decreace> - </Decreace>

            <NoSubscribeData />
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));


export default App;
