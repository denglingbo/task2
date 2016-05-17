/**
 * @file index.js
 * @author deo
 *
 * webpacker
 */
/* eslint-disable */
var _ = require('underscore');
var glob = require('glob');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var BellOnBundlerErrorPlugin = require('bell-on-bundler-error-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var servers = require('./server');

/**
 * Main
 *
 * @param {Object} config, 默认使用 make.webpack.js 中的 config
 * @param {string} root, 项目根目录
 */
var Webpacker = function (config, root) {

    this.config = {};

    _.extend(this.config, config);

    if (!config) {
        throw new Error('[webpacker] webpack-lib/index.js not find {this.config} && {this.dirMap}'); 
        return;
    }

    this.root = root;
    this.src = root + 'src/';

    // 先把 js 遍历出来
    this.jsFiles = this.getJsFiles();

    // 获取和 页面相关的 属性
    var getPager = this.getPager();

    this.htmlPlugins = getPager.htmlPlugins;
    this.jsEntries = getPager.jsEntries;
    this.allChunks = getPager.allChunks;

    // 默认引入项目根目录下的 make.webpack.js
    // make.webpack.js
    this.MakeWebpackConfig = require(this.root + 'make.webpack.js');

    this.webpackConfig = this.MakeWebpackConfig.call(this);

    return this;
};

/**
 * 转换文件前缀
 *
 * @param {string} folderName, 文件路径
 * @param {string} sign, 分隔符
 * @return {string}
 *
 */
Webpacker.prototype.fixFolder = function (folderName, sign) {

    if (folderName && folderName.length) {
        return folderName + sign;
    }

    return '';
};

/**
 * 获取页面名，默认是添加文件目录
 *
 * @param {string} filePath, 文件路径
 * @return {Object} 
 *  object.url 用户的访问路径 index.html, task/detail.html
 *  object.name 页面名 index, task-detail (自动连接文件夹和文件名)
 */
Webpacker.prototype.file = function (filePath) {
    
    // 获取 {folderName}/{pageName}.js
    var pathArr = filePath.split('/');
    var len = pathArr.length;

    if (pathArr && pathArr.length >= 2) {

        var folderName = pathArr[len - 2];
        var fileName = pathArr[len - 1];

        fileName = fileName.substring(0, fileName.lastIndexOf('.'));

        // 不添加 folder
        // EG: index 前面不添加文件名
        var expr = /^(index)$/;

        if (expr.test(fileName) && folderName === fileName) {
            folderName = '';
        }
    }

    return {
        path: this.fixFolder(folderName, '/') + fileName + '.html',
        name: this.fixFolder(folderName, '-') + fileName
    };
};

/**
 * 获取 Javascript
 */
Webpacker.prototype.getJsFiles = function () {
    var me = this;
    var map = {};

    var entryFiles = glob.sync(me.src + '**/*.js');

    entryFiles.forEach(function (filePath) {
        var page = me.file(filePath);
        map[page.name] = filePath;
    });

    return map;
};

/**
 * 自动生成入口配置
 * 入口js 必须和 入口模板名相同
 * EG: a页的入口文件是 [a].tpl|html，那么在 js 目录下必须有一个 [a].js 作为入口文件
 */

Webpacker.prototype.getPager = function () {
    var me = this;

    var jsFiles = this.jsFiles;

    var htmlPlugins = [];
    var jsEntries = {};
    // 提取所有的入口文件中的公共部分
    var allChunks = [];

    // 查找 模板 根目录下的入口文件
    var pages = glob.sync(me.src + '**/*.html');

    pages.forEach(function (filePath) {

        // 这里为了避免文件名重复，所以会在前面添加上文件夹名字
        var page = me.file(filePath);
        console.log(page);
        var conf = {};

        if (page.name in jsFiles) {

            conf.filename = page.path;
            
            // 模板源位置
            conf.template = filePath;

            // 设置 js 入口
            conf.chunks = ['common', page.name];

            // script 插入位置
            conf.inject = 'body';

            htmlPlugins.push(
                new HtmlWebpackPlugin(conf)
            );
            
            jsEntries[page.name] = jsFiles[page.name];

            allChunks.push(page.name);
        }
    });

    return {
        htmlPlugins: htmlPlugins,
        jsEntries: jsEntries,
        allChunks: allChunks
    };
};

/**
 * 获取公共 Plugins
 */
Webpacker.prototype.getCommonPlugins = function () {

    var plugins = [

        new BellOnBundlerErrorPlugin(),

        new webpack.ProgressPlugin(function (percentage, msg) {
            console.log('progress: ' + percentage.toFixed(2) + ' -- ' + msg)
        }),

        // 提取所有 打包后 js 入口文件中的公共部分
        new webpack.optimize.CommonsChunkPlugin({
            name: 'common',
            chunks: this.allChunks
        })
    ];

    // 生产环境 打包
    if (!this.config.debug) {

        // plugins.push(
        //     new webpack.optimize.UglifyJsPlugin()
        // );

        // 没有报错才发布文件
        plugins.push(
            new webpack.NoErrorsPlugin()
        );
    }

    // 开发环境
    else {

        plugins.push(
            new webpack.HotModuleReplacementPlugin()
        );
    }
    
    return plugins;
};

/**
 * 样式预编译器
 * @params {string} name, 预编译样式名
 *
 */
Webpacker.prototype.getCssLoader = function (name) {
    // 任意 动态css 加载器
    var xCss = '';

    if (name) {
        xCss = '!' + name + '-loader';
    }
    
    var cssLoader = null;

    if (this.config.debug) {
        // 开发阶段，css直接内嵌
        cssLoader = 'style-loader!css-loader' + xCss + '!autoprefixer-loader';
    }
    else {
        // 编译阶段，css 分离出来单独引入
        cssLoader = ExtractTextPlugin.extract('style-loader', 'css-loader' + xCss + '!autoprefixer-loader');
    }

    return cssLoader;
};

/**
 * dev 开发模式服务
 */
Webpacker.prototype.devStart = function () {
    servers.dev.call(this);
};

/**
 * 模拟生产环境，测试打包后的文件等，是否正确
 */
Webpacker.prototype.testStart = function () {
    servers.connect.call(this);
    servers.build.call(this);
};

Webpacker.prototype.mockStart = require('./mock');

module.exports = Webpacker;
