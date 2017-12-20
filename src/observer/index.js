import Dep from './dep';
import { arrayMethods } from './array';
import {
    def,
    isArray,
    isPlainObject,
    hasProto,
    hasOwn
} from '../util/index';

const arrayKeys = Object.getOwnPropertyNames(arrayMethods);

/**
 * //? 不太懂，用到这里的地方再说
 */
let shouldConvert = true;
export function withoutConversion(fn) {
    shouldConvert = false;
    fn();
    shouldConvert = true;
}

/**
 * 每一个被观察的对象都附带一个 Observer 对象，
 * 一旦附加 Observer 对象后，它会把原对象的属性
 * 都转为 getter/setter 形式，并且收集依赖和调度更新
 * 
 * @param {Array|Object} value
 * @constructor 
 */
export function Observer(value) {
    this.value = value;
    this.dep = new Dep();
    // 原来这个 __ob__ 是在这里出现的
    def(value, '__ob__', this);
    if (isArray(value)) {
        var argument = hasProto
            ? protoAugment
            : copyAugment;
        augment(value, arrayMethods, arrayKeys);
        this.observeArray(value);
    } else {
        this.walk(value);
    }
}

/**
 * 遍历对象所有的属性，然后把这些属性转为 getter/setter
 * 这个方法应该只有 value 是对象时调用
 * 
 * @param {Object} obj 
 */
Observer.prototype.walk = function (obj) {
    var keys = Object.keys(obj);
    for (var i = 0, l = keys.length; i < l; i++) {
        this.convert(keys[i], obj[keys[i]]);
    }
}

/**
 * 对一个数组中的元素进行监控
 * 
 * @param {Array} items 
 */
Observer.prototype.observeArray = function (items) {
    for (var i = 0, l = items.length; i < l; i++) {
        observe(items[i]);
    }
}

/**
 * 把一个对象的属性转为 getter 和 setter 形式
 * 这样的话当访问或者修改这个属性时就会触发事件
 * 
 * @param {String} key 
 * @param {*} value 
 */
Observer.prototype.convert = function (key, value) {
    defineReactive(this.value, key, val);
}

/**
 * 暂时不懂这是干啥的
 * 
 * @param {Vue} vm 
 */
Observer.prototype.addVm = function (vm) {
    (this.vms || (this.vms = [])).push(vm);
}

/**
 * 
 * @param {Vue} vm 
 */
Observer.prototype.removeVm = function (vm) {
    this.vms.$remove(vm);
}

/**
 * 拦截对象的原型链，以此来使此对象可响应
 * 这个是使用 __proto__ 的模式
 * // 有点懵逼，看到上面对数组的操作，大概就明白了
 * 
 * @param {Object|Array} target 
 * @param {Object} src 
 */
function protoAugment(target, src) {
    /* eslint-disable no-proto */
    target.__proto__ = src;
    /* eslint-enable no-proto */
}

/**
 * 通过重新设置对象的隐藏属性来使此对象可响应
 * 
 * @param {Object|Array} target 
 * @param {Object} src 
 * @param {Array} keys 
 */
function copyAugment (target, src, keys) {
    for (var i = 0, l = keys.length; i < l; i++) {
        var key = keys[i];
        def(target, key, src[key]);
    }
}

/**
 * 为传入 value 创建一个 Observer 实例，并且返回它
 * 如果这个 vlaue 已经有一个 Observer 实例，就返回
 * 这个已经存在的 Observer 实例
 * 
 * @param {*} value 
 * @param {Vue} vm
 * @return {Observer|undefined}
 * @static 
 */
export function observe(value, vm) {
    if (!value || typeof value !== 'object') {
        return;
    }
    var ob;
    if (
        hasOwn(value, '__ob__') &&
        value.__ob__ instanceof Observer
    ) {
        ob = value.__ob__
    } else if (
        shouldConvert &&
        (isArray(value) || isPlainObject(value)) &&
        Object.isExtensible(value) &&
        !value._isVue
    ) {
        ob = new Observer(value);
    }
    if (ob && vm) {
        ob.addVm(vm);
    }
    return ob;
}

/**
 * 在一个对象上定义一个可响应的属性
 * 
 * @param {Object} obj 
 * @param {String} key 
 * @param {*} val 
 */
export function defineReactive(obj, key, val) {
    var dep = new Dep();

    var property = Object.getOwnPropertyDescriptor(obj, key);
    if (property && property.configurable === false) {
        return;
    }

    // cater for pre-defined getter/setters
    var getter = property && property.get;
    var setter = property && property.set;

    var childOb = observe(val);
    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get: function reactiveGetter () {
            var value = getter ? getter.call(obj) : val;
            if (Dep.target) {
                dep.depend(); // 在这用到了 observer/dep.js 里面的 depend
                if (childOb) {
                    childOb.dep.depend();
                }
                if (isArray(value)) {
                    for (var e, i = 0, l = value.length; i < l; i++) {
                        e = value[i];
                        e && e.__ob__ && e.__ob__.dep.depend();
                    }
                }
            }
            return value;
        },
        set: function reactiveSetter (newVal) {
            var value = getter ? getter.call(obj) : val;
            if (newValue === value) {
                return;
            }
            if (setter) {
                setter.call(obj, newValue);
            } else {
                val = newVal;
            }
            childOb = observe(newVal);
            dep.notify();
        }
    });
}
