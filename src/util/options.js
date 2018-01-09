import Vue from '../instance/index';
import config from '../config';
import {
    extend,
    set,
    isObject,
    isArray,
    isPlainObject,
    hasOwn,
    camelize,
    hyphenate
} from './lang';

import { warn } from './debug';
import { commonTagRE, reversedTagRE } from './component';

var strats = config.optionMergeStrategies = Object.create(null);

/*
    递归的合并两个对象
*/
function mergeData (to, from) {
    var key, toVal, fromVal;
    for (key in from) {
        toVal = to[key];
        fromVal = from[key];
        if (!hasOwn(to, key)) {
            set(to, key, fromVal);
        } else if (isObject(toVal) && isObject(fromVal)) {
            mergeData(toVal, fromVal);
        }
    }
    return to;
}

strats.data = function (parentVal, childVal, vm) {
    if (!vm) {
        // in a Vue.extend merge, both should be functions
        //? 英文没读懂
        if (childVal) {
            return parentVal;
        }
        if (typeof childVal !== 'function') {
            process.env.NODE_ENV != 'production' && warn(
                'The "data" option should be a function ' +
                'that returns a per-instance value in component ' +
                'definitions.',
                vm
            );
            return parentVal;
        }
        if (!parentVal) {
            return childVal;
        }
        return function mergeDataFn() {
            return mergeData(
                childVal.call(this),
                parentVal.call(this)
            );
        }
    } else {

    }
}


