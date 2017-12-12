var fs = require('fs');
var zlib = require('zlib');
var rollup = require('rollup');
var uglify = require('uglify-js');
var babel = require('rollup-plugin-babel');
var node = require('rollup-plugin-node-resolve');
var commonjs = require('rollup-plugin-commonjs');
var replace = require('rollup-plugin-replace');
var version = process.env.VERSION || require('../package.json').version;

var banner =
    '/*!\n' +
    ' * Vue.js ' + version + '\n' +
    ' * (c) ' + new Date().getFullYear() + ' Evan You\n' +
    ' * Released under the MIT License.\n' +
    ' */';

var main = fs
    .readFileSync('src/index.js', 'utf-8')
    .replace(/Vue\.version = '[\d\.]+'/, "Vue.version = '" + version + "'");

fs.writeFileSync('src/index.js', main);

var plugins = [
    node(),
    commonjs({
        include: 'node_modules/**'
    }),
    babel({
        exclude: 'node_modules/**'
    })
];

///? Rollup 怎么用的
// 新版本的 Rollup 写法已经变了，自己改写一下
rollup.rollup({
    input: 'src/index.js',
    plugins: plugins
})
.then(async function (bundle) {

    let code = (await bundle.generate({
        format: 'cjs',
        banner: banner
    })).code;

    return write('dist/vue.common.js', code)
})
.then(function () {
    return rollup.rollup({
        input: 'src/index.js',
        plugins: [
            replace({'process.env.NODE_ENV': "'development'"})
        ].concat(plugins)
    })
    .then(function (bundle) {
        return write('dist/vue.js', bundle.generate({
            format: 'umd',
            banner: banner,
            moduleName: 'Vue'
        }).code)
    });
})
.then(function () {
    return rollup.rollup({
        input: 'src/index.js',
        plugins: [
            replace({
                'process.env.NODE_ENV': 'production'
            })
        ].concat(plugins)
    })
    .then(function (bundle) {
        var code = bundle.generate({
            format: 'umd',
            moduleName: 'Vue',
        }).code;
        var minified = babel + '\n' + uglify.minify(code, {
            fromString: true, //? 这个什么意思？
            output: {
                ascii_only: true
            }
        }).code;
        return write('dist/vue.min.js', minified);
    })
    .then(zip);
})
.catch(logError);

function write(dest, code) {
    return new Promise(function (resolve, reject) {
        fs.writeFile(dest, code, function (err) {
            if (err) return reject(err);
            console.log(blue(dest) + ' ' + getSize(code));
            resolve();
        })
    })
}

function zip() {
    return new Promise(function (resolve, reject) {
        fs.readFile('dist/vue.min.js', function (err, buf) {
            if (err) return reject(err);
            zlib.gzip(buf, function (err, buf) {
                if (err) return reject(err);
                write('dist/vue.min.js.gz', buf).then(resolve);
            })
        })
    })
}

function getSize(code) {
    return (code.length / 1024).toFixed(2) + 'kb';
}

function logError(e) {
    console.log(e);
}

function blue(str) {
    return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m';
}
