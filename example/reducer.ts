import {Action, ReducerPiece} from '../.';

interface StateType {
    name: string,
    count: number,
    test: string
}

function reducer(state: StateType, action: Action): StateType {
    switch (action.type) {
        case 'increase':
            return {...state, count: action.payload};

        case 'updateTest':
            return {...state, test: action.payload};

        default:
            return state;
    }
}


const init: StateType = {
    name: 'demo-name',
    count: 0,
    test: ''
};

const reducers: Array<ReducerPiece> = [{
    reducer,
    name: 'example',
    init
}];

export default reducers;
