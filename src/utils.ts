/**
 * create by spstar on 2021/8/31
 * @Author: spstar
 * @Date: 2021/8/31
 * @Version:
 * @Last Modified time: 2021/8/31 3:30 下午
 */

function getValueFromPath(obj:any, path: string):any {
    const pathArr = path.split(/\.|(\[(?:[^[\]]*|(["'])(?:(?!\2)[^\\]|\\.)*?\2)\])/).filter(i => !!i);
    const len = pathArr.length;
    let ret = len < 1 ? obj[path] : obj;

    for(let i = 0; i < len; ++i) {
        ret = /^\[.+\]$/.test(pathArr[i]) ? ret[pathArr[i].slice(1,-1)] : ret[pathArr[i]];

        if (ret == null) {
            return ret;
        }
    }

    return ret;
}

export function getValue(obj:any, path: string | any, defaultValue?: any): any {
    let ret: any = obj == null ?
        undefined :
        typeof path === 'string' ? getValueFromPath(obj, path) : obj[path];

    return ret === undefined ? defaultValue : ret;
}
