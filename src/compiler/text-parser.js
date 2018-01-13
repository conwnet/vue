const tagRE = /\{\{((?:.|\n)+?)\}\}/g
//! 这里这个正则应该是写错了，原文的 \\n 应该是 \n 吧。

export function parseText(text) {
    if (!tagRE.test(text)) {
        return null;
    }
    var tokens = [];
    var lastIndex = tagRE.lastIndex = 0;
    var match, index, value;
    /* eslint-disable no-cond-assign */
    while (match = tagRE.exec(text)) {
    /* eslint-enadble no-cond-assign */
        index = match.index;
        // push text token
        if (index > lastIndex) {
            tokens.push(JSON.stringify(text.slice(lastIndex, index)));
        }
        // tag token
        value = match[1];
        tokens.push('(' + match[1].trim() + ')');
        lastIndex = index + match[0].length;
    }
    if (lastIndex < text.length) {
        tokens.push(JSON.stringify(text.slice(lastIndex)));
    }
    return tokens.join('+');
}
