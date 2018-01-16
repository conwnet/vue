import VNode from './vnode';
import * as dom from './dom';
import { isPrimitive } from '../util/index';

const emptyNode = VNode('', {}, [], undefined, undefined);
const hooks = ['create', 'update', 'remove', 'destroy', 'pre', 'post'];

function isUndef(s) {
    return s === undefined;
}

function isDef(s) {
    return s !== undefined;
}

function sameVnode(vnode1, vnode2) {
    return vnode1.key === vnode2.key && vnode1.sel === vnode2.sel;
}

function createKeyToOldIdx(children, beginIdx, endIdx) {
    var i, map = {}, key;
    for (i = beginIdx; i <= endIdx; ++i) {
        key = children[i].key;
        if (isDef(key)) map[key] = i;
    }
    return map;
}

export default function createPatchFunction(modules, api) {
    var i, j, cbs = {};

    if (isUndef(api)) api = dom;

    for(i = 0; i < hooks.length; ++i) {
        cbs[hooks[i]] = [];
        for (j = 0; j < modules.length; ++j) {
            if (modules[j][hooks[i]] !== undefined)
                cbs[hooks[i]].push(modules[j][hooks[i]]);
        }
    }

    function emptyNodeAt(elm) {
        return VNode(api.tagName(elm).toLowerCase(), {}, [], undefined, elm);
    }

    function createRmCb(childElm, listeners) {
        return function() {
            if (--listeners === 0) {
                var parent = api.parentNode(childElm)
                api.removeChild(parent, childElm);
            }
        }
    }

    function createElm(vnode, insertedVnodeQueue) {
        var i, thunk, data = vnode.data;
        if (isDef(data)) {
            if (isDef(i = data.hook) && isDef(i = i.init)) i(vnode);
            if (isDef(i = data.vnode)) {
                thunk = vnode;
                vnode = i;
            }
        }
        var elm, children = vnode.children, tag = vnode.sel;
        if (isDef(tag)) {
            elm = vnode.elm = isDef(data) && isDef(i = data.ns)
                ? api.createElementNS(i, tag)
                : api.createElement(tag);
            if (Array.isArray(children)) {
                for (i = 0; i < children.length; i++) {
                    api.appendChild(elm, createElm(children[i], insertedVnodeQueue));
                }
            } else if (isPrimitive(vnode.text)) {
                api.appendChild(elm, api.createTextNode(vnode.text));
            }
            for (i = 0; i < cbs.create.length; ++i) cbs.create[i](emptyNode, vnode);
            i = vnode.hook;
            if (isDef(i)) {
                if (i.create) i.create(emptyNode, vnode);
                if (i.insert) insertedVnodeQueue.push(vnode);
            }
        } else {
            elm = vnode.elm = api.createTextNode(vnode.text);
        }
        if (isDef(thunk)) thunk.elm = vnode.elm;
        return vnode.elm;
    }
    
    function addVnodes (parentElm, before, vnodes, startIdx, endIdx, insertedVnodeQueue) {

    }
}

    



