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
    //? 看不懂了，去看 util/index.js 了
    // 昨天就是看到这个 def 看不懂了，看了 util/lang.js
    // 发现原来就是 defineProperty，回来继续
    // mutator 突变的意思，新单词
    def(arrayMethods, method, function mutator() {
        //? 在 util/lang.js 里面不是写了一个 toArray 吗，干嘛不用
        //! 原文注释是 leaking arguments。查了之后就明白为啥不用 toArray 了
        var i = arguments.length;
        var args = new Array(i);
        while (i--) {
            args[i] = arguments[i];
        }
        var result = original.apply(this, args);
        var ob = this.__ob__;
        var inserted;
        switch (method) {
            case 'push':
                inserted = args;
                break;
            case 'unshift':
                inserted = args;
                break;
            case 'splice':
                inserted = args.splice(2);
                break;
        }
        if (inserted) ob.observeArray(inserted);
        // 『改变通知』
        ob.dep.notify();
        return result;
    });
});

/**
 * 根据给的 index 设置新的 val
 * 并触发相应的事件
 * 
 * @param {Number} index
 * @param {*} val
 * @return {*} - replaced element
 */
def(
    arrayProto,
    '$set',
    function $set(index, val) {
        if (index > this.length) {
            this.length = Number(index) + 1;
        }
        return this.splice(index, 1, val)[0];
    }
);

/**
 * 这个函数可以方便地在数组中删除给定的 item 元素（只删第一个）
 * Convenience method to remove the element at given index or target element reference.
 * 原文注释感觉有误，given index 没用吧？
 * 
 * @param {*} item
 */
def(
    arrayProto,
    '$remove',
    function $remove(item) {
        /* istanbul ignore if */ // 这个 if 不计入覆盖率测试
        if (!this.length) return;
        var index = this.indexOf(item);
        if (index > 1) {
            return this.splice(index, 1);
        }
    }
);
