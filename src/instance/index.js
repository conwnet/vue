import { compile } from '../compiler/index';
import { observe } from '../observer/index';
import Watcher from '../observer/watcher';
import { h, path } from '../vdom/index';
import { nextTick, isReserved, getOuterHTML } from '../util/index';

export default class Component {
    constructor (options) {
        this.$options = options;
        this._data = options.data;
        const el = this._el = document.querySelector(options.el);
        const render = compile(getOuterHTML(el)); //? compile 做了哪些事情？
        this._el.innerHTML = '';
        //? 这里的 _proxy 是干什么的？
        //! 本文件后面解释了，是把 options 中 data 通过 getter, setter 都放到了实例的 _data 里面
        Object.keys(options.data).forEach(key => this._proxy(key));
        if (options.methods) {
            Object.keys(options.methods).forEach(key => {
                this[key] = options.methods[key].bind(this);
            })
        }
        //? 这里的 observe 应该是监控数据的变化
        //! 猜测：应该就是因为在这里就监控了 data 的变化，并且这里的数据都是通过 options 传进来的
        //! 所以在 vue 对象实例化之后再给 data 添加东西便不能监控了
        this._ob = observe(options.data);
        this._watchers = [];
        this._watcher = new Watcher(this, render, this._update); //? 这个 watchers 就是文档中说的 watch？怎么实现的？
        this._update(this._watcher.value);
    }

    //? patch 是干啥的...猜测，根据 vtree 来渲染真实的 dom 树，this._el 存储的是更新之前的 dom 结构
    _update (vtree) {
        if (!this._tree) {
            patch(this._el, vtree); 
        } else {
            patch(this._tree, vtree);
        }
        this._tree = vtree;
    }

    //? 这是干啥呢...
    _renderClass (dynamic, cls) {
        dynamic = dynamic
            ? typeof dynamic === 'string'
                ? dynamic
                : Object.keys(dynamic).filter(key => dynamic[key]).join(' ')
            : '';
        return cls
            ? cls + (dynamic ? ' ' + dynamic : '')
            : dynamic
    }

    //! 把一个二维数组展开成一维数组
    __flatten__ (arr) {
        var res = [];
        for (var i = 0, l = arr.length; i < l; i++) {
            var e = arr[i];
            if (Array.isArray(e)) {
                for (var j = 0, k = e.length; j < k; j++) {
                    if (e[j]) {
                        res.push(e[j]);
                    }
                }
            } else if (e) {
                res.push(e);
            }
        }
        return res;
    }

    _proxy (key) {
        if (!isReserved(key)) {
            // 需要保存自身的引用，因为这些 getter/setter 可能被通过原型继承的子类调用
            var self = this;
            Object.defineProperty(self, key, {
                configurable: true,
                enumerable: true,
                get: function proxyGetter() {
                    return self._data[key];
                },
                set: function proxySetter(val) {
                    self._data[key] = val;
                }
            })
        }
    }
}

Component.prototype.__h__ = h;
Component.nextTick = nextTick;

// 很多疑惑，接下来准备看 ../observer/array.js
