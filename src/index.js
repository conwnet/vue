import Vue from './instance/index';
import { h, patch } from './vdom/index';

// export default Vue;

export default new Vue({
    el: '#root',
    data: {
        hello: 'Hello, ',
        names: ['Tom', 'Bob', 'John']
    }
})

// 去看 ./instance/index.js 了
