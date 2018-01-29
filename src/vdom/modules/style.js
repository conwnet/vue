
var raf = (typeof window !== 'undefined' && window.requestAnimationFrame) || setTimeout;
var nextFrame = function(fn) { raf(function () { raf(fn) }) };

function setNextFrame(obj, prop, val) {
    nextFrame(function () { obj[prop] = val });
}

function updateStyle(oldVnode, vnode) {
    var cur, name, elm = vnode.elm,
        oldStyle = oldVnode.data.style || {},
        style = vnode.data.style || {},
        oldHasDel = 'delayed' in oldStyle;
    for (name in oldStyle) {
        if (!style[name]) {
            elm.style[name] = '';
        }
    }
    for (name in style) {
        cur = style[name];
        if (name === 'delayed') {
            
        }
    }
}
