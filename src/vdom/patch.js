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
}
