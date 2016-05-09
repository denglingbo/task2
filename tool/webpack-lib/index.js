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
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var Webpacker = function (config, dirMap) {

    this.config = config;
    this.dirMap = dirMap;

    // 默认引入项目根目录下的 make.webpack.js
    this.MakeWebpackConfig = require(dirMap.root + 'make.webpack.js');

    this.webpackConfig = this.MakeWebpackConfig(this, config);
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
Webpacker.prototype.file = function (filePath, options) {
    
    var opts = {
        noFolder: ['index']
    };

    _.extend(opts, options);

    // 获取 {folderName}/{pageName}.js
    var p = filePath.replace(this.dirMap.src, '');

    p = p.substring(0, p.lastIndexOf('.'));

    var folderName = '';
    var fileName = '';
    var arr = p.split('/');

    if (arr && arr.length === 2) {

        // 不添加 folder
        // EG: index 前面不添加文件名
        var expr = new RegExp('^(' + opts.noFolder.join('|') + ')$');

        if (!expr.test(fileName)) {
            folderName = arr[0];
        }

        fileName = arr[1];
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

    var entryFiles = glob.sync(me.dirMap.src + '**/*.js');

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
Webpacker.prototype.page = function () {
    var me = this;

    var jsFiles = me.getJsFiles();

    var htmlPlugins = [];
    var jsEntries = {};
    // 提取所有的入口文件中的公共部分
    var allChunks = [];

    // 查找 模板 根目录下的入口文件
    var pages = glob.sync(me.dirMap.src + '**/*.html');

    pages.forEach(function (filePath) {

        // 这里为了避免文件名重复，所以会在前面添加上文件夹名字
        var page = me.file(filePath);

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
console.log(jsEntries)
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

    var plugins = [];

    // 非开发环境 打包
    if (!this.config.debug) {

        plugins.push(
            new webpack.optimize.UglifyJsPlugin()
        );

        // 没有报错才发布文件
        plugins.push(
            new webpack.NoErrorsPlugin()
        );

        // 提取样式
        plugins.push(

            // Reference: https://github.com/webpack/extract-text-webpack-plugin
            new ExtractTextPlugin(
                // config.output.assets + '/css/[contenthash:8].[name].min.css'
                this.config.output.assets + '/css/[name].min.css'
            )
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
        cssLoader = ExtractTextPlugin.extract('style', 'css-loader' + xCss + '!autoprefixer-loader');
    }

    return cssLoader;
};


Webpacker.prototype.devStart = require('./server');
Webpacker.prototype.mockStart = require('./mock');

module.exports = Webpacker;
