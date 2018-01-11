var booleanAttrs = ["allowfullscreen", "async", "autofocus", "autoplay", "checked", "compact", "controls", "declare",
                "default", "defaultchecked", "defaultmuted", "defaultSelected", "defer", "disabled", "draggable",
                "enabled", "formnovalidate", "hidden", "indeterminate", "inhert", "ismap", "itemscope", "loop", "multiple",
                "muted", "nohref", "noresize", "noshade", "novalidate", "nowrap", "open", "pauseonexit", "readonly",
                "required", "reversed", "scoped", "seamless", "selected", "sortable", "spellcheck", "translate",
                "truespeed", "typemustmatch", "visible"];

var booleanAttrsDict = {};
for(var i = 0, len = booleanAttrs.length; i < len; i++) {
    booleanAttrsDict[booleanAttrs[i]] = true;
}

function updateAttrs(oldVnode, vnode) {
    var key, cur, old, elm = vnode.elm,
        oldAttrs = oldVnode.data.attrs || {}, attrs = vnode.data.attrs || {};
    
    // 更新修改的属性，增加新的属性
    for (key in attrs) {
        cur = attrs[key];
        old = oldAttrs[key];
        if (old !== cur) {
            //TODO: 增加命名空间属性的支持(setAttributeNS)
            if (!cur && booleanAttrsDict[key])
                elm.removeAttribute(key);
            else
                elm.setAttribute(key, cur);
        }
    }
    //? 注释没看懂
    for (key in oldAttrs) {
        if (!(key in attrs)) {
            elm.removeAttribute(key);
        }
    }
}

export default {
    create: updateAttrs,
    update: updateAttrs
}
