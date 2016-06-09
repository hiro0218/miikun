var webpack = require('webpack');
var path = require('path');
var webpackTargetElectronRenderer = require('webpack-target-electron-renderer');

var config = {
    target: 'atom',
    entry: './renderer/js/app.js',
    output: {
        path: path.join(__dirname, './dist/js'),
        publicPath: './dist/js/',
        filename: "app.js",
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "style!css" },
            {
                test: /\.vue$/,
                loader:'vue-loader',
                exclude: /node_modules/
            },
        ]
    },
    resolve: {
        root: __dirname,
        extensions: ['', '.js', '.vue'],
        packageMains: ['webpack', 'browser', 'web', 'browserify', ['jam', 'main'], 'main'],
        modulesDirectories: [
            'vendor',
            'node_modules',
            'bower_components',
        ],
    },
    vue: {
        loaders: {
            js: ''
        }
    },
    plugin:[
        new webpack.optimize.UglifyJsPlugin({
            compressor: {
                warnings: false
            }
        }),
    ]
};

config.target = webpackTargetElectronRenderer(config);

module.exports = config;
