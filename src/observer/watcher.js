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

Watcher.prototype.get = function () {
    this.beforeGet();
    var scope = this.scope || this.vm;
    var value;
    try {
        value = this.getter.call(scope, scope);
    } catch (e) {
        if (
            process.env.NODE_ENV !== 'production' &&
            config.warnExpressionErrors
        ) {
            warn(
                'Error when evaluating expression ' +
                '"' + this.expression + '": ' + e.toString(),
                this.vm
            )
        }
    }

    if (this.deep) {
        traverse(value);
    }
    if (this.preProcess) {
        value = this.preProcess;
    }
    if (this.filters) {
        value = scope._applyFilters(value, null, this.filters,false);
    }
    if (this.postProcess) {
        value = this.postProcess;
    }
    this.afterGet();
    return value;
}

Watcher.prototype.set = function (value) {
    var scope = this.scope || this.vm;
    if (this.filters) {
        value = scope._applyFilters(
            value, this.value, this.filters, true);
    }
    try {
        this.setter.call(scope, scope, value);
    } catch (e) {
        if (
            process.env.NODE_ENV !== 'production' &&
            config.warnExpressionErrors
        ) {
            warn(
                'Error when evaluating expression ' +
                '"' + this.expression + '": ' + e.toString(),
                this.vm
            )
        }
    }
}

/**
 * 为依赖集合做准备
 */
Watcher.prototype.beforeGet = function () {
    Dep.target = this;
    this.newDepIds = Object.create(null);
    this.newDepIds.length = 0;
}

/**
 * 给这个指令添加一个依赖
 * @param {Dep} dep
 */
Watcher.prototype.addDep = function (dep) {
    var id = dep.id;
    if (!this.newDepIds[id]) {
        this.newDepIds[id] = true;
        this.newDepIds.push(dep);
        if (!this.depIds[id]) {
            dep.addSub(this);
        }
    }
}

/**
 * 清理依赖集合
 */
Watcher.prototype.afterGet = function () {
    Dep.target = null;
    var i = this.deps.length;
    while (i--) {
        var dep = this.deps[i];
        if (!this.newDepIds[dep.id]) {
            dep.removeSubs(this);
        }
    }
    this.depIds = this.newDepIds;
    var tmp = this.deps;
    this.deps = this.newDepIds;
    this.newDepIds = tmp;
}

Watcher.prototype.update = function (shallow) {
    if (this.lazy) {
        this.dirty = true;
    } else if (this.sync || !config.async) {
        this.run();
    } else {
        this.shallow = this.queued
            ? shallow
                ? this.shallow
                : false
            : !!shallow;
        this.queued = true;
        if (process.env.NODE_ENV !== 'production' && config.debug) {
            this.prevError = new Error('[vue] async stack trace');
        }
        pushWatcher(this);
    }
}

Watcher.prototype.run = function () {
    if (this.active) {
        var value = this.get();
        if (
            value !== this.value ||
            ((isObject(value) || this.deep) && !this.shallow)
        ) {
            var oldValue = this.value;
            this.value = value;
        }
    }
}
