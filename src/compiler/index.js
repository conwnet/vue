import { parse } from './html-parser';
import { generate } from './codegen';

const cache = Object.create(null);

export function compile(html) {
    html = html.trim();
    const hit = cache[html];
    // console.log(JSON.stringify(parse(html), (k, v) => k !== 'parent' ? v : undefined, 2));
    return hit || (cache[html] = generate(parse(html)));
}
