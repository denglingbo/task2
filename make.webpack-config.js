/**
 * @file make-webpack.config.js
 * @author deo
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
                console.log('progress: ' + percentage + ' -- ' + msg)
            }),

            new CopyPlugin([
                {
                    from: './dep/', 
                    to: './dep/'
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
        return this.webpackConfig; 
    },

    setDevtool: function () {

        // 输出 source map
        if (this.config.debug) {
            this.webpackConfig.devtool = 'eval-source-map';
        }
        else {
            this.webpackConfig.devtool = 'source-map';
        }
    },

    /**
     * 获取并设置 Javascript 入口
     *
     */
    setJsFiles: function () {

        var map = {};

        var jsDir = path.join(__dirname, this.config.srcDir.root);
        var entryFiles = glob.sync(jsDir + '/**/*.' + this.config.extMap.js);

        entryFiles.forEach(function (filePath) {
            var filename = filePath.substring(filePath.lastIndexOf('\/') + 1, filePath.lastIndexOf('.'));
            map[filename] = filePath;
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

            var filename = filePath.substring(filePath.lastIndexOf('\/') + 1, filePath.lastIndexOf('.'));
            
            var conf = {};

            if (filename in me.jsFiles) {

                conf.filename = filename + '.' + me.config.extMap.outputTemplate;
                
                // 模板源位置
                conf.template = filePath;

                // 设置 js 入口
                conf.chunks = ['common', filename];

                // script 插入位置
                conf.inject = 'body';

                r.push(
                    new HtmlWebpackPlugin(conf)
                );

                me.webpackConfig.entry[filename] = me.jsFiles[filename];

                // 提取公共文件
                r.push(
                    new CommonsChunkPlugin({
                        name: 'common',
                        chunks: conf.chunks
                    })
                );
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
            filename: config.debug ? '[name].js' : config.output.assets + '/js/[name].[hash].min.js',

            // 调试目录 或者 CDN 目录 
            publicPath: config.debug ? '/' : 'http://' + config.host + ':' + config.port + '/',

            chunkFilename: config.debug ? '[chunkhash:8].chunk.js' : config.output.assets + '/js/[chunkhash:8].chunk.min.js'
        };
    },

    /**
     * 设置 resolve
     *
     */
    setResolve: function () {
        var config = this.config;

        this.webpackConfig.resolve = {

            // 指定模块查找的根目录
            root: [path.join(__dirname, config.srcDir.root), config.srcDir.nodeModules],

            alias: {},

            extensions: ['', '.js'].concat(config.extMap.resolveExts)
        };

        // this.webpackConfig.resolveLoader = {
        //     root: [config.srcDir.nodeModules]
        // };
    },

    /**
     * 设置 alias
     * @param {Object} alias,
     *
     */
    setAlias: function (alias) {

        if (_.isObject(alias)) {
            _.extend(this.webpackConfig.resolve.alias, alias);
        }
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

        var imgPath = config.debug ? '' : '/' + config.output.assets + 'img/';

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
                    'image?{bypassOnDebug: true, progressive: true, \
                        optimizationLevel: 3, pngquant:{quality: "65-80", speed: 4}}',
                    'url?name=' + imgPath + '[hash:8].[name].[ext]'
                ],
                exclude: [config.nodeModules]
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
     * 添加Loaders
     *
     */
    addLoaders: function (loaders) {

        if (_.isArray(loaders)) {
            this.webpackConfig.module.loaders = this.webpackConfig.module.loaders.concat(loaders);
        }

        if (_.isObject) {
        this.webpackConfig.module.loaders.push(loaders);
        }
    },

    /**
     * 清空 plugins
     *
     */
    clearLoaders: function () {
        this.webpackConfig.module.loaders = [];
    },

    /**
     * 添加入口配置
     *
     */
    setPlugins: function () {

        var _opts = {
            clear: false,
            add: null
        };

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
                    config.output.assets + '/css/[contenthash:8].[name].min.css'
                )
            );
        }

        this.plugins = this.plugins.concat(this.pageEntries);

        this.webpackConfig.plugins = this.plugins;
    },

    /**
     * 添加插件
     *
     */
    addPlugins: function (plugins) {

        if (_.isArray(plugins)) {
            this.plugins = this.plugins.concat(plugins);
        
            this.webpackConfig.plugins = this.plugins;
        }
    },

    /**
     * 清空 plugins
     *
     */
    clearPlugins: function () {
        this.webpackConfig.plugins = this.plugins = [];
    },


    /**
     * 样式预编译器
     * @params {string} name, 预编译样式名
     *
     */
    getCssLoader: function (name) {
        
        var cssLoader = null;

        if (this.config.debug) {
            // 开发阶段，css直接内嵌
            cssLoader = 'style-loader!css-loader!' + name + '-loader!autoprefixer-loader';
        }
        else {
            // 编译阶段，css 分离出来单独引入
            cssLoader = ExtractTextPlugin.extract('style', 'css-loader!' + name + '-loader!autoprefixer-loader?minimize');
        }

        return cssLoader;
    },




    /**
     * Mock server
     *
     */
    mock: function (opts) {
        var mockConfig = {
            host: this.config.host,
            port: this.config.mockPort,
            path: '/',
            mockDir: './mock'
        };

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

        devServer.listen(me.config.port, me.config.host, function() {
            var url = 'http://' + me.config.host + ':' + me.config.port;

            console.log('----------[dev] webpack server start -----------');
            console.log('SERVER: ' + url);
            console.log('------------------------------------------------');
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