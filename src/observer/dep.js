//? 尴尬，别的地方都是 var，这里怎么用 let 了
//! 原来在函数里面定义变量就用了 var，在函数外面就用了 let
let uid = 0;

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 * //? 这注释我也没看懂，等想明白了再来更新吧
 * //? 貌似是要实现一个 发布-订阅，但是这东西在哪里用到了呢
 * //! 看到了在 overver/index.js 里面用了，但是还是不知道是干啥的
 * 
 * @constructor
 */
export default function Dep() {
    this.id = uid++;
    this.subs = [];
}

 // 当前只在执行的目标 watcher
 // 这是一个全局队列，因为要保证在任意时刻只能用一个 watcher 执行
Dep.target = null;

/**
 * 增加一个订阅者
 * 
 * @param {Directive} sub 
 */
Dep.prototype.addSub = function (sub) {
    this.subs.push(sub);
}

/**
 * 删除一个指令订阅
 * @param {Directive} sub 
 */
Dep.prototype.removeSub = function (sub) {
    this.subs.$remove(sub);
}

/**
 * 把自己添加到目标 watcher 的依赖
 */
Dep.prototype.depend = function () {
    Dep.target.addDep(this);
}

/**
 * 把新的值通知给所有订阅者
 */
Dep.prototype.notify = function () {
    // 先稳定所有订阅者
    // 做一个浅拷贝，保证订阅者不会在通知的过程中发生变动
    var subs = this.subs.slice();
    for (var i = 0, l = subs.length; i < l; i++) {
        subs[i].update();
    }
}
