/**
 * @file make-webpack.config.js
 * @author deo
 */
'use strict';

var _ = require('underscore');
var path = require('path');
var glob = require('glob');
var webpack = require('webpack');
var BellOnBundlerErrorPlugin = require('bell-on-bundler-error-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyPlugin = require('copy-webpack-plugin');
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;


var src = 'src';
var depDir = path.join(__dirname, '/dep/');
var common = path.join(__dirname, '/src/common/');


var util = {};

/**
 * 转换文件前缀
 *
 * @param {string} folderName, 文件路径
 * @param {string} sign, 分隔符
 * @return {string}
 *
 */
util.fixFolder = function (folderName, sign) {

    if (folderName && folderName.length) {
        return folderName + sign;
    }

    return '';
}

/**
 * 获取页面名，默认是添加文件目录
 *
 * @param {string} filePath, 文件路径
 * @return {Object} 
 *  object.url 用户的访问路径 index.html, task/detail.html
 *  object.name 页面名 index, task-detail (自动连接文件夹和文件名)
 */
util.page = function (filePath) {

    var folderName = '';
    var filename = filePath.substring(filePath.lastIndexOf('\/') + 1, filePath.lastIndexOf('.'));
    
    // index 前面不添加文件名
    if (filename !== 'index') {
        var pageDir = path.resolve(__dirname, src);
        var dir = pageDir.replace(/\\/g, '/');
        var fileArr = filePath.replace(dir, '');

        if (fileArr.length && fileArr.length > 1) {
            folderName = fileArr.split('/')[1];
        }
    }

    return {
        path: util.fixFolder(folderName, '/') + filename + '.html',
        name: util.fixFolder(folderName, '-') + filename
    }
};

/**
 * 获取 Javascript
 */
util.getJsFiles = function () {
    var map = {};

    var jsDir = path.join(__dirname, src);
    var entryFiles = glob.sync(jsDir + '/**/*.js');

    entryFiles.forEach(function (filePath) {
        var page = util.page(filePath);
        map[page.name] = filePath;
    });

    return map;
};

/**
 * 自动生成入口配置
 * 入口js 必须和 入口模板名相同
 * EG: a页的入口文件是 [a].tpl|html，那么在 js 目录下必须有一个 [a].js 作为入口文件
 */
util.pageConf = function () {

    var jsFiles = util.getJsFiles();

    var htmlPlugins = [];
    var jsEntries = {};
    // 提取所有的入口文件中的公共部分
    var allChunks = [];

    // 查找 模板 根目录下的入口文件
    var pageDir = path.resolve(__dirname, src);
    var pages = glob.sync(pageDir + '/**/*.html');

    pages.forEach(function (filePath) {

        // 这里为了避免文件名重复，所以会在前面添加上文件夹名字
        var page = util.page(filePath);

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
util.getCommonPlugins = function (config) {

    var plugins = [];

    // 非开发环境 打包
    if (!config.debug) {

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
                config.output.assets + '/css/[name].min.css'
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
util.getCssLoader = function (config, name) {
    // 任意 动态css 加载器
    var xCss = '';

    if (name) {
        xCss = '!' + name + '-loader';
    }
    
    var cssLoader = null;

    if (config.debug) {
        // 开发阶段，css直接内嵌
        cssLoader = 'style-loader!css-loader' + xCss + '!autoprefixer-loader';
    }
    else {
        // 编译阶段，css 分离出来单独引入
        cssLoader = ExtractTextPlugin.extract('style', 'css-loader' + xCss + '!autoprefixer-loader');
    }

    return cssLoader;
};


/**
 * Make webpack config method
 *
 */
var MakeWebpackConfig = function (config) {

    var pageConf = util.pageConf();


    var webpackConfig = {};

    if (config.debug) {
        webpackConfig.devtool = 'eval-source-map';
    }


    // 页面 js 入口
    webpackConfig.entry = pageConf.jsEntries;
    
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
        new CommonsChunkPlugin({
            name: 'common',
            chunks: pageConf.allChunks
        }),

        // 提供全局使用
        new webpack.ProvidePlugin({
            $: 'zepto'
        })
    ];

    var commonPlugins = util.getCommonPlugins(config);

    // 提取公共部分
    webpackConfig.plugins = webpackConfig.plugins.concat(commonPlugins);

    // * 最为重要的部分，其中包含页面入口配置
    webpackConfig.plugins = webpackConfig.plugins.concat(pageConf.htmlPlugins);

    // 设置 resolve
    webpackConfig.resolve = {

        // 指定模块查找的根目录
        root: [path.join(__dirname, src), 'node_modules'],

        alias: {
            zepto: depDir + 'zepto',
            common: common,
            dep: depDir
        },

        extensions: ['', '.js', '.tpl', '.html']
    };

    // 输出配置
    webpackConfig.output = {

        // 输出根目录
        path: 'dist',

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
                loader: util.getCssLoader(config)
            },
            { 
                // sass 加载器
                // Reference: https://github.com/webpack/style-loader
                // Reference: https://github.com/webpack/css-loader
                // Reference: https://github.com/webpack/sass-loader
                // Reference: https://github.com/webpack/extract-text-webpack-plugin
                test: /\.scss$/, 
                loader: util.getCssLoader(config, 'sass')
                // include: [path.resolve(__dirname, config.srcDir + 'static/css')],  //把要处理的目录包括进来
                // exclude: []  //排除不处理的目录
            }
        ]
    };

    // console.log(webpackConfig);

    return webpackConfig;

};

module.exports = MakeWebpackConfig;
