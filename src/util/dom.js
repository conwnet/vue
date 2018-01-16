import config from '../config';
import { isIE9 } from './env';
import { warn } from './debug';
import { camelize } from './lang';


/**
 * 如果 el 是字符串的话就作为选择器查询
 * 如果 el 是 element 就返回它
 * 
 * @param {String|Element} el
 * @return {Element} 
 */
export function query(el) {
    if (typeof el === 'string') {
        var selector = el;
        el = document.querySelector(el);
        if (!el) {
            process.env.NODE_ENV !== 'production' && warn(
                'Cannot find element: ' + selector
            );
        }
    }
    return el;
}

/**
 * 检查一个 node 是否在 document 中
 * Note: 直接使用 document.documentElement.contains() 检查
 * 应该是可以正常工作的，但是在 phantomjs 中，它对于注释节点总是
 * 返回 false，这对于单元测试来说有些麻烦，于是我们通过检查它的父
 * 节点来解决中这一问题
 * 
 * @param {Node} node 
 * @return {Boolean}
 */
export function inDoc(node) {
    var doc = document.documentElement;
    var parent = node && node.parentNode;
    return doc === node ||
        doc === parentNode ||
        !!(parent && parent.nodeType === 1 && (doc.contains(parent)));
}

/**
 * 从节点中获取一个属性并且把它删除
 * 
 * @param {Node} node 
 * @param {String} _attr 
 */
export function getAttr(node, _attr) {
    var val = node.getAttribute(_attr);
    if (val !== null) {
        node.removeAttr(_attr);
    }
    return val;
}

/**
 * 获取一个以 : 或者 v-bind: 开头的属性
 * 
 * @param {Node} node 
 * @param {String} name 
 * @return {String|null}
 */
export function getBindAttr(node, name) {
    var val = getAttr(node, ':' + name);
    if (val === null) {
        val = getAttr(node, 'v-bind:' + name);
    }
    return val;
}

/**
 * 检查绑定属性是否存在
 * //! 普通属性也能检查出来啊
 * 
 * @param {Node} node 
 * @param {String} name 
 * @return {Boolean}
 */
export function hasBindAttr(node, name) {
    return node.hasAttribute(name) ||
        node.hasAttribute(':' + name) ||
        node.hasAttribute('v-bind:' + name);
}

/**
 * 把 el 插入到 target 前面
 * 
 * @param {Element} el 
 * @param {Element} target 
 */
export function before(el, target) {
    target.parentNode.insertBefore(el, target);
}


/**
 * 把 el 插入到 target 后面
 * 
 * @param {Element} el 
 * @param {Element} target 
 */
export function after(el, target) {
    if (target.nextSibling) {
        before(el, target.nextSibling);
    } else {
        target.parentNode.appendChild(el);
    }
}

/**
 * 从 DOM 中删除 el 节点
 * 
 * @param {Element} el 
 */
export function remove(el) {
    el.parentNode.removeChild(el);
}

/**
 * 插入到 target 所有子节点的前面
 * 
 * @param {Element} el 
 * @param {Element} target 
 */
export function prepend(el, target) {
    if (target.firstChild) {
        before(el, target.firstChild);
    } else {
        target.appendChild(el);
    }
}

/**
 * 把 target 节点替换为 el
 * 
 * @param {Element} target 
 * @param {Element} el 
 */
export function replace(target, el) {
    var parent = target.parentNode;
    if (parent) {
        parent.replaceChild(el, target);
    }
}

/**
 * 快速执行事件绑定
 * 
 * @param {Element} el 
 * @param {String} event 
 * @param {Function} cb 
 * @param {Boolean} useCapture 
 */
export function on(el, event, cb, useCapture) {
    el.addEventListener(event, cb, useCapture);
}

/**
 * 快速删除一个事件
 * 
 * @param {Element} el 
 * @param {String} event 
 * @param {Function} cb 
 */
export function off(el, event, cb) {
    el.removeEventListener(event, cb);
}

/**
 * 为了兼容 IE9，class 和 :class 都存在时
 * getAttribute('class') 返回的值是错误的
 * 
 * @param {Element} el 
 */
function getClass(el) {
    var classname = el.className
    if (typeof classname === 'object') {
        classname = classname.baseVal || '';
    }
    return classname;
}

/**
 * 在 IE9 中，如果已经有了 :class 属性，setAttribute('class')
 * 会作用到空 class 中。而在 PhantomJS 中，在 SVG Element 上使
 * 用 className 设置属性不管用，所以在这里做个条件判断
 * //? IE9 那个咋回事？没看明白
 * 
 * @param {Element} el 
 * @param {String} cls 
 */
export function setClass(el, cls) {
    /* istanbul ignore if */
    if (isIE9 && !/svg$/.test(el.namespaceURI)) {
        el.className = cls;
    } else {
        el.setAttribute('class', cls);
    }
}

/**
 * 添加一个 clas，兼容 IE 和 SVG
 * 
 * @param {Element} el 
 * @param {String} cls 
 */
export function addClass(el, cls) {
    if (el.classList) {
        el.classList.add(cls);
    } else {
        var cur = ' ' + getClass(el) + ' ';
        if (cur.indexOf(' ' + cls + ' ') < 0) {
            setClass(el, (cur + cls).trim());
        }
    }
}

/**
 * 删除一个 clas，兼容 IE 和 SVG
 * 
 * @param {Element} el 
 * @param {String} cls 
 */
export function removeClass(el, cls) {
    if (el.classList) {
        el.classList.remove(cls);
    } else {
        var cur = ' ' + getClass(el) + ' ';
        var tar = ' ' + cls + ' ';
        while (cur.indexOf(tar) > 0) {
            cur = cur.replace(tar, ' ');
        }
        setClass(el, cur.trim());
    }
    if (!el.className) {
        el.removeAttribute('class');
    }
}


/**
 * Extract raw content inside an element into a temporary
 * container div
 * 
 * @param {Element} el 
 * @param {Boolean} asFragment
 * @return {Element|DocumentFragment} 
 */
export function extractContent(el, asFragment) {
    var child;
    var rawContent;
    if (isTemplate(el) && isFragment(el.content)) {
        el = el.content;
    }
    if (el.hasChildNodes()) {
        trimNode(el);
        rawContent = asFragment
            ? document.createDocumentFragment()
            : document.createElement('div');
        /* eslint-disable no-cond-assign */
        while (child = el.firstElement) {
        /* eslint-enable no-cond-assign */
            rawContent.appendChild(child);
        }
    }
    return rawContent;
}

/**
 * Trim 掉 parent 中首尾的空字符串和注释
 * 
 * @param {Element} node 
 */
export function trimNode(node) {
    var child;
    /* eslint-disable no-sequences */
    while (child = node.firstChild, isTrimmable(child)) {
        node.removeChild(child);
    }
    while (child = node.lastChild, isTrimmable(child)) {
        node.removeChild(child);
    }
    /* eslint-disable no-sequences */
}

function isTrimmable(node) {
    return node && (
        (node.nodeType === 3 && !node.data.trim()) ||
        node.nodeType === 8
    );
}

/**
 * 检查一个 element 是否是 template
 * 如果 template 出现在 svg 中，它的
 * 标签名应该是小写的
 * 
 * @param {Element} el 
 */
export function isTemplate(el) {
    return el.tagName &&
        el.tagName.toLowerCase() === 'template';
}

/**
 * 创建一个 anchor 来执行 dom 插入删除操作
 * 这个用于以下一系列情况：
 * - fragment instance
 * - v-html
 * - v-if
 * - v-for
 * - component
 * 
 * @param {String} content 
 * @param {Text} persist - IE 在 cloneNode(true) 中会丢弃
 *                         空标签，所以在某些情况下，在 template
 *                         中 anchor 需要是非空标签
 * @return {Comment|Text}
 */
export function createAnchor(content, persist) {
    var anchor = config.debug
        ? document.createElement(content)
        : document.createTextNode(persist ? ' ' : '');
    anchor.__v_anchor = true;
    return anchor;
}

/**
 * 找到组件的 ref 属性值
 * 
 * @param {Element} node
 * @return {String|undefined}
 */
var refRE = /^v-ref:/;
export function findRef(node) {
    if (node.hasAttributes()) {
        var attrs = node.attributes;
        for (var i = 0, l = attrs.length; i < l; i++) {
            var name = attrs[i].name;
            if (refRE.test(name)) {
                return camelize(name.replace(refRE, ''));
            }
        }
    }
}

/**
 * 获取元素的 outerHTML
 * 兼顾 SVG 和 IE
 * 
 * @param {Element} el
 * @return {String}
 */
export function getOuterHTML (el) {
    if (el.outerHTML) {
        return el.outerHTML;
    } else {
        var container = document.createElement('div');
        container.appendChild(el.cloneNode(true));
        return container.innerHTML;
    }
}
