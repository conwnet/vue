import assert from 'assert';
import { compile } from '~/compiler/index';
import { generate } from '~/compiler/codegen';
import { parse } from '~/compiler/html-parser';
import { parseText } from '~/compiler/text-parser';

console.dump = function (obj) {
    console.log(JSON.stringify(obj, (k, v) => { if (k !== 'parent') return v; }, 2));
}

describe('compile 函数测试', () => {
    let html = `<div class="idiv" length="10" :checked="name" style="color: red;" :style="{width: '20px'}" :name="123">
        <p class="ip" :class="'iip'" v-for="i in [1, 2, 3]">Hello {{name}}</p>
        <p v-if="hello">Good {{boy}} </p>
    </div>`.trim();
    let ast = parse(html);
    // console.dump(ast);
    const genFunc = generate(ast);

    // console.log(parseText(`Hello {{name + 123}} {{ number }} good boy`));
    // it(describe)
});
