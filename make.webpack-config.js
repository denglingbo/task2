/**
 * @file make-webpack.config.js
 * @author deo
 *
 * 测试版本，未对代码进行优化，暂未把底层逻辑和业务分开
 *
 */
'use strict';

var path = require('path');
var glob = require('glob');
var webpack = require('webpack');
var _ = require('underscore');
var BellOnBundlerErrorPlugin = require('bell-on-bundler-error-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyPlugin = require('copy-webpack-plugin');
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;

var mockServer = require('gulp-mock-server');
var webDevServer = require('webpack-dev-server');
var connect = require('gulp-connect');

/**
 * 用于 mock 时候替换
 *
 */
var replaceHost = function (host) {
    return host.replace(/([http|https]+:\/\/|:(.)+)/gi, '');
};

/**
 * webpack config method
 *
 */
var MakeWebpackConfig = function (config) {
    this.name = 'Make Webpack Config';

    this.config = config;
};

MakeWebpackConfig.prototype = {

    init: function () {

        this.webpackConfig = {
            entry: {}
        };

        // js 入口
        this.jsFiles = {};

        // 页面入口配置
        this.pageEntries = [];

        // 使用的插件集合
        this.plugins = [
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
                }
            ])
        ];

        this.setDevtool();
        this.setJsFiles();
        this.setPageEntries();

        this.setOutput();
        this.setResolve();
        this.setPlugins();

        this.setLoaders();

        // webpack dev server 配置
        if (this.config.debug) {
            this.webpackConfig.devServer = this.config.devServer;
        }
    },

    /**
     * 返回 webpack config
     *
     */
    get: function () {
        console.log(this.webpackConfig);
        return this.webpackConfig; 
    },

    setReleaseMock: function () {
        // this.webpackConfig.devtool = 'source-map';
        this.plugins.push(
            new CopyPlugin([
                {
                    from: './cordova.js',
                    to: './cordova.js'
                }
            ])
        );
    },

    setDevtool: function () {

        // 输出 source map
        if (this.config.debug) {
            this.webpackConfig.devtool = 'eval-source-map';
        }
        else {
            // this.webpackConfig.devtool = 'source-map';
        }
    },

    /**
     * 转换文件前缀
     *
     * @param {string} folderName, 文件路径
     * @param {string} sign, 分隔符
     * @return {string}
     *
     */
    fixFolder: function (folderName, sign) {

        if (folderName && folderName.length) {
            return folderName + sign;
        }

        return '';
    },

    /**
     * 获取页面名，默认是添加文件目录
     *
     * @param {string} filePath, 文件路径
     * @return {Object} 
     *  object.url 用户的访问路径 index.html, task/detail.html
     *  object.name 页面名 index, task-detail (自动连接文件夹和文件名)
     *
     */
    getPage: function (filePath) {

        var folderName = '';
        var filename = filePath.substring(filePath.lastIndexOf('\/') + 1, filePath.lastIndexOf('.'));
        
        // 首页前面不添加文件名
        if (filename !== 'index') {
            var pageDir = path.resolve(__dirname, this.config.srcDir.root);
            var dir = pageDir.replace(/\\/g, '/');
            var fileArr = filePath.replace(dir, '');

            if (fileArr.length && fileArr.length > 1) {
                folderName = fileArr.split('/')[1];
            }
        }

        var ext = this.config.extMap.outputTemplate;

        return {
            path: this.fixFolder(folderName, '/') + filename + '.' + ext,
            name: this.fixFolder(folderName, '-') + filename
        }
    },

    /**
     * 获取并设置 Javascript 入口
     *
     */
    setJsFiles: function () {
        var me = this;
        var map = {};

        var jsDir = path.join(__dirname, this.config.srcDir.root);
        var entryFiles = glob.sync(jsDir + '/**/*.' + this.config.extMap.js);

        entryFiles.forEach(function (filePath) {
            var page = me.getPage(filePath);
            map[page.name] = filePath;
        });

        this.jsFiles = map;

        // this.webpackConfig.entry = this.jsFiles;
    },

    /**
     * 自动生成入口配置
     * 入口js 必须和 入口模板名相同
     * EG: a页的入口文件是 [a].tpl|html，那么在 js 目录下必须有一个 [a].js 作为入口文件
     *
     */
    setPageEntries: function () {
        var me = this;
        var r = [];

        // 查找 模板 根目录下的入口文件
        var pageDir = path.resolve(__dirname, me.config.srcDir.root);
        var pageEntries = glob.sync(pageDir + '/**/*.' + me.config.extMap.srcTemplate);

        pageEntries.forEach(function (filePath) {

            // 这里为了避免文件名重复，所以会在前面添加上文件夹名字
            var page = me.getPage(filePath);

            var conf = {};

            if (page.name in me.jsFiles) {

                conf.filename = page.path;
                
                // 模板源位置
                conf.template = filePath;

                // 设置 js 入口
                conf.chunks = ['common', page.name];

                // script 插入位置
                conf.inject = 'body';

                r.push(
                    new HtmlWebpackPlugin(conf)
                );

                me.webpackConfig.entry[page.name] = me.jsFiles[page.name];

                console.log(' ');
                console.log('-----[' + page.name + ']-----');
                console.log(conf);
                console.log(' ');
            }
        });

        this.pageEntries = r;
    },

    /**
     * 设置 output 配置
     *
     */
    setOutput: function () {
        var config = this.config;

        // 输出配置
        this.webpackConfig.output = {

            // 输出根目录
            path: config.output.root,

            // 输出文件
            // filename: config.debug ? '[name].js' : config.output.assets + '/js/[name].[hash].min.js',
            filename: config.debug ? '[name].js' : config.output.assets + '/js/[name].min.js',

            // 调试目录 或者 CDN 目录 
            publicPath: config.debug ? '/' : config.publicPath,

            // chunkFilename: config.debug ? '[chunkhash:8].chunk.js' : config.output.assets + '/js/[chunkhash:8].chunk.min.js'
            chunkFilename: config.debug ? 'chunk.js' : config.output.assets + '/js/chunk.min.js'
        };
    },

    /**
     * 设置 resolve
     *
     */
    setResolve: function () {
        var config = this.config;

        var depDir = path.join(__dirname, '/dep/');
        var common = path.join(__dirname, '/src/common/');

        this.webpackConfig.resolve = {

            // 指定模块查找的根目录
            root: [path.join(__dirname, config.srcDir.root), config.srcDir.nodeModules],

            alias: {
                zepto: depDir + 'zepto',
                common: common,
                dep: depDir,

                page: common + 'page'
            },

            extensions: ['', '.js'].concat(config.extMap.resolveExts)
        };

        // this.webpackConfig.resolveLoader = {
        //     root: [config.srcDir.nodeModules]
        // };
    },

    /**
     * 添加 Loaders
     *
     */
    setLoaders: function () {
        var config = this.config;

        this.webpackConfig.module = {

            preLoaders: config.preLoaders || [],

            loaders: []
        };

        var imgPath = config.debug ? '' : config.output.assets + '/img/';

        // 添加一个内置的 loaders 
        // for jingoal
        this.webpackConfig.module.loaders = [
            {
                // 图片加载器
                // Reference: https://github.com/webpack/url
                // Reference: https://github.com/webpack/image-webpack-loader
                // limit=10000&
                test: /\.(jpe?g|png|gif)$/i,
                loaders: [
                    'url-loader?limit=1&name=' + imgPath + '[hash:8].[name].[ext]'
                ]
                // loaders: [
                    // 'image?{bypassOnDebug: true, progressive: true, \
                    //     optimizationLevel: 3, pngquant:{quality: "65-80", speed: 4}}',
                    // 'url?name=' + imgPath + '[hash:8].[name].[ext]'
                // ],
                // loader: 'url-loader?limit=1&name=' + imgPath + '[hash:8].[name].[ext]'
                // exclude: [config.nodeModules]
            },
            {
                // 模板 加载器
                // Reference: https://github.com/webpack/html-loader
                test: /\.tpl$/,
                // loader: 'mustache'
                loader: 'html-loader'
            },
            {
                test: /\.css$/, 
                loader: this.getCssLoader()
            },
            { 
                // sass 加载器
                // Reference: https://github.com/webpack/style-loader
                // Reference: https://github.com/webpack/css-loader
                // Reference: https://github.com/webpack/sass-loader
                // Reference: https://github.com/webpack/extract-text-webpack-plugin
                test: /\.scss$/, 
                loader: this.getCssLoader('sass')
                // include: [path.resolve(__dirname, config.srcDir + 'static/css')],  //把要处理的目录包括进来
                // exclude: []  //排除不处理的目录
            }
        ];
    },

    /**
     * 添加入口配置
     *
     */
    setPlugins: function () {

        var config = this.config;

        // 非开发环境 打包
        if (!config.debug) {

            this.plugins.push(
                new webpack.optimize.UglifyJsPlugin()
            );

            // 没有报错才发布文件
            this.plugins.push(
                new webpack.NoErrorsPlugin()
            );
        }
        // 开发环境
        else {

            this.plugins.push(
                new webpack.HotModuleReplacementPlugin()
            );
        }

        if (!config.debug) {
            // 提取样式
            this.plugins.push(

                // Reference: https://github.com/webpack/extract-text-webpack-plugin
                new ExtractTextPlugin(
                    // config.output.assets + '/css/[contenthash:8].[name].min.css'
                    config.output.assets + '/css/[name].min.css'
                )
            );
        }

        // 提取所有的入口文件中的公共部分
        var pageChunks = [];
        var entries = this.webpackConfig.entry;
        for (var key in entries) {
            pageChunks.push(key);
        }
        this.plugins.push(
            new CommonsChunkPlugin({
                name: 'common',
                chunks: pageChunks
            })
        );

        this.plugins.push(
            new webpack.ProvidePlugin({
                $: 'zepto'
            })
        );

        this.plugins = this.plugins.concat(this.pageEntries);

        this.webpackConfig.plugins = this.plugins;
    },

    /**
     * 样式预编译器
     * @params {string} name, 预编译样式名
     *
     */
    getCssLoader: function (name) {
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
    },



    /**
     * Mock server
     *
     */
    mock: function (opts) {

        var mockConfig = {
            host: replaceHost(this.config.host),
            port: this.config.mockPort,
            path: '/',
            mockDir: './mock',
            https: false,
            // ,https: true
            // https: {
            //     key: './ssl/server.pem',
            //     cert: './ssl/kibana.pem'
            // },
            directoryListing: true,
            proxies: [
                {
                    source: this.config.proxyPrefix,
                    target: this.config.proxyPath
                    // ,options: {
                    //     headers: {
                    //         'header': 'name'
                    //     }
                    // }
                }
            ],
            // 这个为 true https 才有用
            livereload: true
        };
        console.log(mockConfig);
        _.extend(mockConfig, opts);

        return mockServer(mockConfig);
    },

        
    /**
     * Dev
     * 获取 dev server
     * @param {Function} callback, 在 makeWebpackConfig.get() 之前对 makeWebpack 进行其他操作
     * @return {Object} dev server
     */
    devStart: function (callback) {
        var me = this;

        me.config.debug = true;

        me.init();

        if (callback) {
            callback(me, webpack);
        }

        var webpackConfig = me.get();
        var compiler = webpack(webpackConfig);
        var devServer = new webDevServer(compiler, webpackConfig.devServer);

        devServer.listen(me.config.port, replaceHost(me.config.host), function() {
            var url = replaceHost(me.config.host) + ':' + me.config.port;

            console.log(' ');
            console.log('----------[dev] webpack server start -----------');
            console.log('SERVER: ' + url);
            console.log('------------------------------------------------');
            console.log(' ');
        });

        return devServer;
    },

    /**
     * Release
     * 获取 build server
     * @param {Function} gulpCallback, 这个一定要加上，虽然不加也ok，但是加上才能看到 Finish 信息
     * @param {Function} callback, 在 makeWebpackConfig.get() 之前对makeWebpack 进行其他操作
     */
    build: function (gulpCallback, callback) {
        var me = this;

        me.config.debug = false;

        me.init();

        if (callback) {
            callback(me, webpack);
        }
        
        var webpackConfig = me.get();

        // Run webpack
        webpack(

            // webpack config
            webpackConfig,

            function (err, stats) {
                if (err) {
                    throw new gutil.PluginError('webpack', err);
                }
                
                if (gulpCallback) {
                    gulpCallback();
                }
            }
        );
    },

    /**
     * Release
     * 创建本地服务
     *
     */
    connect: function () {

        return connect.server({
            root: this.config.output.root,
            port: this.config.port,
            livereload: true
        });
    }

};


module.exports = MakeWebpackConfig;
