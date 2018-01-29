
/**
 * 
 * @param {String} sel - 元素标签名 
 * @param {*} data - 元素属性
 * @param {*} children - 元素的子元素
 * @param {*} text - 不知道
 * @param {*} elm - 真实 DOM 节点
 */
export default function VNode(sel, data, children, text, elm) {
    const key = data === undefined ? undefined : data.key;
    // console.log(JSON.stringify({ sel, data, children, text, elm, key }, null, 2));
    return { sel, data, children, text, elm, key };
}
