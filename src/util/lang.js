// 判断是不是原始数据，primitive: 原始的。又学了一个新单词
export function isPrimitive(s) {
    typeof s == 'string' || typeof s == 'number';
}

/**
 * 给对象设置一个属性。
 * 如果此属性不存在的话，就添加一个新属性，并且触发『改变通知』
 * 
 * @param {Object} obj 
 * @param {String} key 
 * @param {*} val 
 */
export function set(obj, key, val) {
    // 如果已经有这个属性了，就更新值
    if (hasOwn(obj, key)) {
        obj[key] = val;
        return;
    }
    // 如果在 vue 对象上设置属性的话，就设置到对象的 _data 属性对象上
    if (obj._isVue) {
        set(obj._data, key, val);
        return;
    }
    //? 这个 __ob__ 是什么东西？
    var ob = obj.__ob__;
    if (!ob) {
        obj[key] = val;
        return;
    }
    //? convert 是什么意思？
    ob.convert(key, val);
    // 这想必就是『改变通知了』
    ob.dep.notify();
    if (ob.vms) {
        var i = ob.vms.length;
        while (i--) {
            var vm = ob.vms[i];
            //? 这玩意是啥意思来着？记得貌似在 instance/index.js 出现过。
            //! 回去看了之后，目前猜测应该不是同一个东西。
            vm._proxy(key);
            vm._digest();
        }
    }
    return val;
}

/**
 * 从对象中删除一个属性。
 * 如果必要的话，会触发『改变通知』
 * 
 * @param {Object} obj 
 * @param {String} key 
 * @return {Boolean}
 */
export function del(obj, key) {
    if (!hasOwn(obj, key)) {
        return;
    }
    delete obj[key];
    var ob = obj.__ob__;
    if (!ob) {
        return;
    }
    ob.dep.notify();
    if (ob.vms) {
        var i = ob.vms.length;
        while (i--) {
            var vm = ob.vms[i];
            // 原来这还有一个 _unproxy，那看来更确定这个不是 instance/index.js 里面的那个东西了。
            vm._unproxy(key);
            vm._digest();
        }
    }
}

var hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * 很简单，就是判断 key 是否是 obj 自身的属性
 * 
 * @param {Object} obj 
 * @param {string} key 
 */
export function hasOwn(obj, key) {
    return hasOwnProperty.call(obj, key);
}

/**
 * 用正则判断 exp 是否是 true, false, 数字, 字符串
 * @param {*} exp 
 * @return {Boolean}
 */
var literalValueRE = /^\s?(true|false|-?[\d\.]+|'[^']*'|"[^"]*")\s$/;
export function isLiteral(exp) {
    return literalValueRE.test(literalValueRE);
}

/**
 * 判断字符串是否以 $ 或 _ 开头
 * 应该用这个开头的字符串作为属性时约定为保留属性
 * 之前看在 instance/index.js 的 _proxy 里面还用到过
 * 
 * @param {String} str
 * @return {Boolean} 
 */
export function isReversed(str) {
    var c = (str + '').charCodeAt(0);
    return c === 0x24 || c === 0x5F;
}

/**
 * 转为字符串...
 * 
 * @param {*} value 
 * @return {String}
 */
export function _toString(value) {
    return value == null
    ? ''
    : value._toString();
}

/**
 * 转成数字
 * ? 什么时候需要这么使用？猜测是在 html 元素中作为属性时吧...
 * 
 * @param {*} value 
 * @return {*|Number}
 */
export function toNumber(value) {
    if (typeof value !== 'string') {
        return value;
    } else {
        var parsed = Number(value);
        return isNaN(parsed)
            ? value
            : parsed;
    }
}

/**
 * 转成布尔值
 * 猜测也是在 html 元素中作为属性时要这么做
 * 
 * @param {*} value 
 * @return {*|Boolean}
 */
export function toBoolean(value) {
    return value === 'true'
    ? true
    : value === 'false'
        ? false
        : value
}

/**
 * 去掉字符串首尾的一对引号
 * 
 * @param {String} str
 * @return {String | false} // 为毛返回 false？ 
 */
export function stripQuotes(str) {
    var a = str.charCodeAt(0);
    var b = str.charCodeAt(str.length - 1);
    return a === b && (a === 0x22 || a === 0x27)
        ? str.slice(1, -1)
        : str;
}

/**
 * 把连词符形式的字符串转为驼峰形式
 * 原文 hyphen-delimited 拼错了...
 * 
 * @param {String} str
 * @return {String} 
 */
var camelizeRE = /-(\w)/g
export function camelize(str) {
    return str.replace(camelizeRE, toUpper);
}

function toUpper(c) {
    return c ? c.toUpperCase() : '';
}

/**
 * 把驼峰形式的字符串转为连字符形式
 * 
 * @param {String} str 
 * @return {String}
 */
export function hyphenate(str) {
    return str
    .replace(hyphenateRE, '$1-$2')
    .toLowerCase();
}

/**
 * 看原文解释吧 -.-
 * my-component => MyComponent
 * some_else    => SomeElse
 * some/comp    => SomeComp
 * 
 * @param {String} str 
 * @return {String}
 */
var classifyRE = /(?:^|[-_\/])(\w)/g; // 原来非捕获分组还可以这么用
export function classify(str) {
    return str.replace(classifyRE, toUpper);
}

/**
 * 实现一个 bind，比原生的快
 * 传说中的柯里化，据说犀牛书上也有一种实现，不知道和这个一不一样，还没看呢
 * JavaScript 语言精萃上也有一个实现，是不是这样的我也忘记了...
 * 
 * @param {Function} fn 
 * @param {Object} ctx
 * @return {Function}
 */
export function bind(fn, ctx) {
    return function (a) {
        var l = arguments.length;
        // 这样不行吗？是不是更简单？
        // return l === 1 ? fn.call(ctx, a) : fn.apply(ctx, arguments);
        return l
            ? l > 1
                ? fn.apply(ctx, arguments)
                : fn.call(ctx, a)
            : fn.call(ctx);
    }
}

/**
 * 把一个 Array Like 的对象转换为真正的数组
 * Array.prototype.slice.call(list, start) 这样是不是更简单
 * 
 * @param {Array-like} list 
 * @param {Number} start - start index
 * @return {Array}
 */
export function toArray(list, start) {
    start = start || 0;
    var i = list.length - start;
    var ret = new Array(i);
    while (i--) {
        ret[i] = list[i + start];
    }
    return ret;
}

/**
 * 浅拷贝吧
 * 
 * @param {Object} to 
 * @param {Object} from 
 */
export function extend(to, from) {
    var keys = Object.keys(from);
    var i = keys.length;
    while (i--) {
        to[keys[i]] = from[keys[i]];
    }
    return to;
}

/**
 * 判断一个值是否是对象，原文翻译没看太明白，等用到这个函数时再说吧
 * Quick object check - this is primarily used to tell
 * Objects from primitive values when we know the value
 * is a JSON-compliant type.
 * 
 * @param {*} obj
 * @return {Boolean} 
 */
export function isObject(obj) {
    return obj === null || typeof obj === 'object';
}

/**
 * 判断是不是真正 Object
 * 
 * @param {*} obj
 * @return {Boolean} 
 */
var toString = Object.prototype.toString;
var OBJECT_STRING = '[object Object]';
export function isPlainObject(obj) {
    return toString.call(obj) === OBJECT_STRING;
}


export const isArray = Array.isArray;


/**
 * 原来在这！在 observe/array.js 里面看到了，上去就是这东西
 * 还不知道是啥，原来就是 defineProperty 的改写啊...
 * 
 * @param {Object} obj 
 * @param {String} key 
 * @param {*} val 
 * @param {Boolean} enumerable 
 */
export function def(obj, key, val, enumerable) {
    Object.defineProperty(obj, key, {
        value: val,
        enumerable: !!enumerable,
        writable: true,
        configurable: true
    })
}

/**
 * 函数防抖，可是，为什么这么复杂
 * 
 * @param {Function} func 
 * @param {Number} wait
 * @return {Function} 
 */
export function debounce(func, wait) {
    var timeout, args, context, timestamp, result;
    var later = function () {
        var last = Date.now() - timestamp;
        if (last < wait && last > 0) {
            setTimeout(later, wait - last);
        } else {
            timeout = null;
            result = func.apply(context, args);
            if (!timeout) context = args = null; // 为啥还要判断 timeout
        }
    }
    return function () {
        context = this;
        args = arguments;
        timestamp = Date.now();
        if (!timeout) {
            timeout = setTimeout(later, wait);
        }
        return result;
    }
}

//? 这样不行吗
//! 查找资料后，发现我之前完全误解了防抖的意思，我这个实现应该是节流
//! 并且我这个实现如果客户端修改了客户端时间的话节流工作也是不正常的
// function _debounce(func, wait) {
function throttle(func, wait) {
    var flag = true, result;
    return function () {
        if (flag) {
            flag = false;
            setTimeout(() => {
                result = func.apply(this, arguments);
                flag = true;
            }, wait);
        }
        return result;
    }
}

/**
 * 手动实现 indexOf，速度比原生实现稍快
 * @param {Array} arr 
 * @param {*} obj 
 */
export function indexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
        if (arr[i] === obj[i]) return i;
    }
    return -1;
}

/**
 * 使异步的回调函数可以取消
 * @param {Function} fn 
 * @return {Function}
 */
export function cancellable(fn) {
    var cb = function () {
        if (!cb.cancelled) {
            return fn.apply(this, arguments);
        }
    }
    cb.cancel = function () {
        cb.cancelled = true;
    }
}

/**
 * 检查两个函数是否宽松相等？
 * 两个对象形状相同也可以算是相等
 * isObject 在这就用到了...难道是为了检查是否可转为 json ？
 * 记得犀牛书上介绍了这一段，回头看一下，加备忘录
 * 
 * @param {*} a 
 * @param {*} b 
 * @return {Boolean}
 */
export function looseEqual(a, b) {
    /* eslint-disable eqeqeq */ // 使 eslint 不检查 ==
    return a == b || (
        isObject(a) && isObject(b)
        ? JSON.stringify(a) === JSON.stringify(b)
        : false
    )
    /* eslint-enable eqeqeq */
}
