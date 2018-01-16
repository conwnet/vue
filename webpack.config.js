var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: path.resolve(__dirname, 'src/index.js'),
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'vue-[hash].js',
        library: 'Vue',
        libraryTarget: 'umd'
    },
    devtool: 'eval-source-map',
    devServer: {
        open: true,
        host: '0.0.0.0'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: 'babel-loader'
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({ template: path.resolve(__dirname + '/index.html') })
    ]
}
