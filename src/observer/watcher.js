import config from '../config';
import Dep from './dep';
import { pushWatcher } from 'batcher';
import {
    extend,
    warn,
    isArray,
    isObject,
    nextTick
} from '../util/index';

let uid = 0;

/**
 * 一个 watcher 用来解析一个表达式，收集它的依赖
 * 然后当表达式的值发生变化时触发回调函数
 * 这个 watcher 既用于 $watch() 也用于指令
 * 
 * @param {Vue} vm 
 * @param {String|Function} expOrFn 
 * @param {Function} cb 
 * @param {Object} options
 *                 - {Array} filters
 *                 - {Boolean} twoWay
 *                 - {Boolean} deep
 *                 - {Boolean} user
 *                 - {Boolean} sync
 *                 - {Boolean} lazy
 *                 - {Function} [preProcess]
 *                 - {Function} [postProcess]
 * @constructor
 */
export default function Watcher(vm, expOrFn, cb, options) {
    // 用参数 options 扩展自身
    if (options) {
        extend(this, options);
    }
    var isFn = typeof expOrFn === 'function';
    this.vm = vm;
    vm._watchers.push(this);
    this.expression = expOrFn;
    this.cb = cb;
    this.id = ++uid; // batching 的 id，原来在这呢
    this.active = true;
    this.dirty = this.lazy; // for lazy watchers，那是啥，还不懂
    this.deps = [];
    this.newDeps = [];
    this.depIds = Object.create(null);
    this.newDepIds = null;
    this.prevError = null; // 异步错误栈，这又是啥

    if (isFn) {
        this.getter = expOrFn;
        this.setter = undefined;
    } else {
        // 原来还有 vue-lite 这个东西...并且不能 watch 表达式
        //? 不过我也还不知道怎么才算 watch 表达式
        warn('vue-lite only supports watching functions');
    }

    // state for avoiding false triggers for deep and Array
    // watchers during vm._digest()
    //? 啥玩意，不懂
    this.value = this.lazy
        ? undefined
        : this.get()
    this.queued = this.shallow = false;
}

