/**
 * @file make-webpack.config.js
 * @author deo
 */
'use strict';

var _ = require('underscore');
var path = require('path');
var webpack = require('webpack');
var BellOnBundlerErrorPlugin = require('bell-on-bundler-error-plugin');
var CopyPlugin = require('copy-webpack-plugin');

// Webapck utils
var Webpacker = require('./tool/webpack-lib/index');

// var dirMap = {
//     root: path.join(__dirname, '/'),
//     src: path.join(__dirname, '/src/'),
//     dep: path.join(__dirname, '/dep/'),
//     common: path.join(__dirname, '/src/common/')
// };

/**
 * Make webpack config method
 *
 * @param {Webpacker} webpacker, new Webpacker webpack-lib 会自动调用 make.webpack.js
 */
var MakeWebpackConfig = function (webpacker, config) {

    var page = webpacker.page();

    var webpackConfig = {};

    if (config.debug) {
        webpackConfig.devtool = 'eval-source-map';
    }


    // 页面 js 入口
    webpackConfig.entry = page.jsEntries;
    
    // 插件集合
    webpackConfig.plugins = [

        new BellOnBundlerErrorPlugin(),

        new webpack.ProgressPlugin(function (percentage, msg) {
            console.log('progress: ' + percentage.toFixed(2) + ' -- ' + msg)
        }),

        // to: 实际为 path/xxx
        new CopyPlugin([
            {
                from: './dep/',
                to: './dep/'
            },
            {
                from: './src/common/img/',
                to: './common/img/'
            },
            {
                from: './cordova.js',
                to: './cordova.js'
            }
        ]),

        // 提取所有 打包后 js 入口文件中的公共部分
        new webpack.optimize.CommonsChunkPlugin({
            name: 'common',
            chunks: page.allChunks
        }),

        // 提供全局使用
        new webpack.ProvidePlugin({
            $: 'zepto'
        })
    ];

    var commonPlugins = webpacker.getCommonPlugins();

    // 提取公共部分
    webpackConfig.plugins = webpackConfig.plugins.concat(commonPlugins);

    // * 最为重要的部分，其中包含页面入口配置
    webpackConfig.plugins = webpackConfig.plugins.concat(page.htmlPlugins);

    // 设置 resolve
    webpackConfig.resolve = {

        // 指定模块查找的根目录
        root: [this.dirMap.src, '/node_modules'],

        alias: {
            zepto: this.dirMap.dep + 'zepto',
            dep: this.dirMap.dep,
            common: this.dirMap.common
        },

        extensions: ['', '.js', '.tpl', '.html']
    };

    // 输出配置
    webpackConfig.output = {

        // 输出根目录
        path: path.join(__dirname, 'dist'),

        // 输出文件
        // filename: config.debug ? '[name].js' : 'common/js/[name].[hash].min.js',
        filename: config.debug ? '[name].js' : 'common/js/[name].min.js',

        // 调试目录 或者 CDN 目录 
        publicPath: config.debug ? '/' : '/',

        // chunkFilename: config.debug ? '[chunkhash:8].chunk.js' : 'common/js/[chunkhash:8].chunk.min.js'
        chunkFilename: config.debug ? 'chunk.js' : 'common/js/chunk.min.js'
    };


    var imgPath = config.debug ? '' : 'common/img/';

    // module 加载器
    webpackConfig.module = {

        preLoaders: [],

        // 添加一个内置的 loaders 
        loaders: [
            {
                // 图片加载器
                // Reference: https://github.com/webpack/url
                test: /\.(jpe?g|png|gif)$/i,
                loaders: [
                    'url-loader?limit=1&name=' + imgPath + '[hash:8].[name].[ext]'
                ]
            },
            {
                // 模板 加载器
                // Reference: https://github.com/webpack/html-loader
                test: /\.tpl$/,
                loader: 'html-loader'
            },
            {
                test: /\.css$/, 
                loader: webpacker.getCssLoader()
            },
            { 
                // sass 加载器
                // Reference: https://github.com/webpack/style-loader
                // Reference: https://github.com/webpack/css-loader
                // Reference: https://github.com/webpack/sass-loader
                // Reference: https://github.com/webpack/extract-text-webpack-plugin
                test: /\.scss$/, 
                loader: webpacker.getCssLoader('sass')
                // include: [path.resolve(__dirname, config.srcDir + 'static/css')],  //把要处理的目录包括进来
                // exclude: []  //排除不处理的目录
            }
        ]
    };

    // console.log(webpackConfig);

    return webpackConfig;

};

module.exports = MakeWebpackConfig;
