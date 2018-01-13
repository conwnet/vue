import assert from 'assert';
import { parse } from '~/compiler/html-parser';

/*
describe('html-parser test', () => {
    let html = `<p color="red">Good <span style="font-size: 18px;">Job</span><p>`;
    let root = parse(html);
    it('parse', () => {
        assert.equal(root.tag, 'p');
        assert.equal(root.attrs[0].name, 'color');
        assert.equal(root.children[0].parent, root);
    });
});
*/