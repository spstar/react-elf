// import 'react-app-polyfill/ie11';

import Store, {getElfDispatch, getElfState, useElf, useElfSubscribe} from '../../dist';
import * as React from 'react';
import {FC} from 'react';
import * as ReactDOM from 'react-dom';
import reducers from "./reducer";

const Count: FC = () => {
    const [[count]] = useElfSubscribe('example-m', 'count');

    return <div>{count}</div>;
};

const TestMapData: FC = () => {
    const [[value], dispatch] = useElfSubscribe('example-m', [['complexData', 'value']]);

    return (
        <div>
            <span>订阅的Map 数据：{value}</span>
            <button onClick={() => dispatch('updateComplexValue', Math.random())}>更新Map 数据</button>
        </div>
    );
};

const Increace: FC = ({children}) => {
    const dispatch = getElfDispatch('example-m');

    function onIncrease() {
        const state = getElfState('example-m');

        state.set('otherKey', 'Error!!');
        state.setIn(['complexData', 'value'], 'Error!!');
        console.log('after set ::', state, state.toJS());
        dispatch('increase', state.count + 1);
    }

    return <button onClick={onIncrease}>{children}</button>;
};

const Decreace: FC = ({children}) => {
    const [{count}, dispatch] = useElf('example-m');

    function onIncrease() {
        dispatch('increase', count - 1);
    }

    return (
        <button style={{margin: 20}} onClick={onIncrease}>
            {children}
        </button>
    );
};

function getValueFromState(state, field) {
    return state.getIn(Array.isArray(field) ? field : [field]);
}

const App: FC = () => {
    return (
        <div>
            {/*<Store key={1} reducers={reducers} getValueFromState={getValueFromState}  />*/}
            <Store reducers={reducers}/>
            <div>Immutable State Demo</div>
            <Count/>
            <Increace> + </Increace>
            <Decreace> - </Decreace>

            <TestMapData/>
        </div>
    );
};

ReactDOM.render(<App/>, document.getElementById('root'));

export default App;
