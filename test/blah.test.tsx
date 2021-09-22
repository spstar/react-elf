// import React from 'react';
// import * as ReactDOM from 'react-dom';
// import { Default as Thing } from '../stories/Thing.stories';
import {getValue} from '../src/utils'
import _get from 'lodash/get'
//
// describe('Thing', () => {
//   it('renders without crashing', () => {
//     const div = document.createElement('div');
//     ReactDOM.render(<Thing />, div);
//     ReactDOM.unmountComponentAtNode(div);
//   });
// });

describe('utils/getValue', () => {
    const obj = {"": 'hello "" key!', a: {b: {c: {arr: [{test: 99, 0: 'hello number0'}]}, un: undefined}, en: null}};
    const arr = [{a: {b: 'arr path'}}, 3];

    console.log(JSON.stringify(obj));

    test(`null :: a.b[c].arr[0].test :: undefined :: undefined`, () => {
        expect(getValue(null, 'a.b[c].arr[0].test')).toBe(undefined);
    });

    test(`Map :: a.b[c].arr[0].test :: undefined :: undefined`, () => {
        expect(getValue(new Map(), 'a.b[c].arr[0].test')).toBe(undefined);
    });

    test(`a.b[c].arr[0].test :: undefined :: 99`, () => {
        expect(getValue(obj, 'a.b[c].arr[0].test')).toBe(99);
    });

    test(`a.b[c].arr[0].0 :: undefined :: 'hello number0'`, () => {
        expect(getValue(obj, 'a.b[c].arr[0].0')).toBe('hello number0');
    });

    test('a.en:: undefined :: null', () => {
        expect(getValue(obj, 'a.en')).toBe(null);
    });

    test('a.b.un:: undefined :: undefined', () => {
        expect(getValue(obj, 'a.b.un')).toBe(undefined);
    });

    test('ac.bc.un :: undefined :: undefined', () => {
        expect(getValue(obj, 'a.bc.un')).toBe(undefined);
    });

    test('a.bc.un:: 100 :: 100', () => {
        expect(getValue(obj, 'a.bc.un', 100)).toBe(100);
    });

    test('a.en:: 100 :: null', () => {
        expect(getValue(obj, 'a.en', 100)).toBe(null);
        expect(typeof obj).toBe('object')
    });

    test('"" :: undefined :: hello "" key!', () => {
        expect(getValue(obj, '')).toBe('hello "" key!');
    });

    test('"[0 :: undefined :: undefined', () => {
        expect(getValue(obj, '[0')).toBe(undefined);
    });

    test(`${JSON.stringify(arr)}:: Number(1):: undefined :: 3`, () => {
        expect(getValue(arr, 1)).toBe(3);
    });

    test('lodash-> a.b[c].arr[0].test :: undefined :: 99', () => {
        expect(_get(obj, 'a.b[c].arr[0].test')).toBe(99);
    });

    test(`lodash-> a.b[c].arr[0].0 :: undefined :: 'hello number0'`, () => {
        expect(_get(obj, 'a.b[c].arr[0].0')).toBe('hello number0');
    });
    test(`lodash-> '' :: undefined :: 'hello "" key!'`, () => {
        expect(_get(obj, '')).toBe('hello "" key!');
    });
    test('lodash-> [xx :: undefined :: undefined', () => {
        expect(_get(obj, '[xx')).toBe(undefined);
    });
});
