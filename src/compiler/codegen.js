import { parseText } from './text-parser';

const bindRE = /^:|^v-bind:/;
const onRE = /%@|^v-on:/;
//? 猜测，mustUsePropsRE 匹配的属性，是需要双向绑定的，所以要单独
//? 判断，这个存到了 props 中而不是 attrs 中
const mustUsePropsRE = /^(value|selected|checked|muted)$/;

export function generate(ast) {
    const code = genElement(ast);
    // console.log(code);
    //? 这里为啥用字符串来构造函数呢？为了使用这个 with？
    //! 应该就是为了使用这个 with (this)，因为要解析 {{ name }} 这样
    //! 的模板语法时，要保证 name 属于当前组件来正确解析
    return new Function (`with (this) { return ${code}}`);
}

function genElement(el, key) {
    let exp;
    if (exp = getAttr(el, 'v-for')) {
        return genFor(el, exp);
    } else if (exp = getAttr(el, 'v-if')) {
        return genIf(el, exp);
    } else if (el.tag === 'template') {
        return genChildren(el);
    } else {
        return `__h__('${ el.tag }', ${ genData(el, key) }, ${ genChildren(el) })`;
    }
}

function genIf(el, exp) {
    return `(${ exp }) ? ${ genElement(el) } : ''`;
}

function genFor(el, exp) {
    const inMatch = exp.match(/([a-zA-Z_][\w]*)\s+(?:in|of)\s+(.*)/);
    if (!inMatch) {
        throw new Error('Invalid v-for expression: ' + exp);
    }
    const alias = inMatch[1].trim();
    exp = inMatch[2].trim();
    const key = el.attrsMap['track-by'] || 'undefined';
    return `(${ exp }).map(function (${ alias }, $index) { return ${ genElement(el, key) }})`;
}

function genData(el, key) {
    if (!el.attrs.length) {
        return '{}';
    }
    let data = key ? `{key: ${key},` : `{`;
    //? 猜测应该就是在合并 class
    //! 原来在 instance/index.js 里面实现这个 _renderClass 了，竟然忘记了，作用就是合并 class
    if (el.attrsMap[':class'] || el.attrsMap['class']) {
        data += `class: _renderClass(${ el.attrsMap[':class'] }, "${ el.attrsMap['class'] || '' }"),`;
    }
    let attrs = `attrs: {`;
    let props = `props: {`;
    let hasAttrs = false;
    let hasProps = false;
    for (let i = 0, l = el.attrs.length; i < l; i++) {
        let attr = el.attrs[i];
        let name = attr.name;
        if (bindRE.test(name)) {
            name = name.replace(bindRE, '');
            if (name === 'class') {
                continue;
            } else if (name === 'style') {
                data += `style: ${ attr.value },`
            } else if (mustUsePropsRE.test(name)) {
                hasProps = true;
                props += `"${ name }": (${ attr.value }),`;
            } else {
                hasAttrs = true;
                attrs += `"${ name }": (${ attr.value }),`;
            }
        } else if (onRE.test(name)) {
            name = name.replace(onRE, '');
            // TODO
        } else if (name !== 'class') {
            hasAttrs = true;
            attrs += `"${ name }": (${ JSON.stringify(attr.value) }),`
        }
    }
    if (hasAttrs) {
        data += attrs.slice(0, -1) + '},';
    }
    if (hasProps) {
        data += props.slice(0, -1) + '},';
    }
    return data.replace(/,$/, '') + '}';
}

function genChildren(el) {
    if (!el.children.length) {
        return 'undefined';
    }
    //! 这个 __flatten__ 在 instance/index.js 里面实现了，用来把二维数组展开为一维数组
    return '__flatten__([' + el.children.map(genNode).join(',') + '])';
}

function genNode(node) {
    if (node.tag) {
        return genElement(node);
    } else {
        return genText(node);
    }
}

function genText(text) {
    if (text === ' ') {
        return '" "';
    } else {
        const exp = parseText(text);
        if (exp) {
            return 'String(' + escapeNewlines(exp) + ')';
        } else {
            return escapeNewlines(JSON.stringify(text));
        }
    }
}

function escapeNewlines(str) {
    return str.replace(/\n/g, '\\n');
}

function getAttr(el, attr) {
    let val;
    if (val = el.attrsMap[attr]) {
        el.attrsMap[attr] = null;
        for (let i = 0, l = el.attrs.length; i < l; i++) {
            if (el.attrs[i].name === attr) {
                el.attrs.splice(i, 1);
                break;
            }
        }
    }
    return val;
}
