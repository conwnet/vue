import { def } from '../util/index';

const arrayProto = Array.prototype;
export const arrayMethods = Object.create(arrayProto);

/**
 * 拦截会使数组数据发生变化的方法，然后触发事件
 */

;[
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reserve'
].forEach(function (method) {
    var original = arrayMethods[method];
    // 看不懂了，去看 util/index.js 了
});
