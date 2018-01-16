/* 全局变动检测 */

// 我们能用 __proto__ 吗
export const hasProto = '__proto__' in {};

// Browser environment sniffing
export const inBrowser =
    typeof window !== 'undefined' &&
    Object.prototype.toString.call(window) !== '[object Object]';

// detect devtools
export const devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBLE_HOOK__

// 使用 UA 对特定的浏览器特性就行嗅探
const UA = inBrowser && window.navigator.userAgent.toLowerCase();
export const isIE9 = UA && UA.indexOf('msie 9.0') > 0;
export const isAndoird = UA && UA.indexOf('android') > 0;

let transitionProp;
let transitionEndEvent;
let animationProp;
let animationEndEvent;

// 过渡属性/事件嗅探
if (inBrowser && !isIE9) {
    const isWebkitTrans =
        window.ontransitionend === undefined &&
        window.onwebkittransitionend !== undefined;
    const isWebkitAnim = 
        window.onanimationend === undefined &&
        window.onwebkitanimation !== undefined;
    transitionProp = isWebkitTrans
        ? 'WebkitTransition'
        : 'transition';
    transitionEndEvent = isWebkitTrans
        ? 'WebkitTransitionEnd'
        : 'transitionend';
    animationProp = isWebkitAnim
        ? 'WebkitAnimation'
        : 'animation';
    animationEndEvent = isWebkitAnim
        ? 'WebkitAnimationEnd'
        : 'animationend';
}

export {
    transitionProp,
    transitionEndEvent,
    animationProp,
    animationEndEvent
};

/**
 * 延迟异步执行一个任务，理想状态这个任务应该是 microtask
 * 如果 MutationObserver 不可用的话，降级使用 setTimeout(0)
 * 
 * @param {Function} cb
 * @param {Object} ctx
 */
export const nextTick = (function () {
    var callbacks = [];
    var pending = false;
    var timerFunc;
    function nextTickHandler () {
        pending = false;
        var copies = callbacks.slice(0);
        callbacks = [];
        for (var i = 0; i < copies.length; i++) {
            copies[i]();
        }
    }

    /* istanbul ignore if */
    if (typeof MutationObserver !== 'undefined') {
        var counter = 1;
        var observer = new MutationObserver(nextTickHandler);
        var textNode = document.createTextNode(counter);
        observer.observe(textNode, {
            characterData: true
        });
        timerFunc = function () {
            counter = (counter + 1) % 2;
            textNode.data = counter;
        };
    } else {
        // Webpack 会试图插入一个 setImmediate 的 shim
        // 如果 global 变量中有这个东西，这样就能不让他 shim 了
        // 这样可以打包时省点儿体积
        const context = inBrowser
            ? window
            : typeof global !== 'undefined' ? global : {};
        timerFunc = context.setImmediate || setTimeout
    }
    return function (cb, ctx) {
        var func = ctx
            ? function () { cb.call(ctx) }
            : cb;
        callbacks.push(func);
        if (pending) return ;
        timerFunc(nextTickHandler, 0);
    }
})();
