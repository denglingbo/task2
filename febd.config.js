/**
 * @file config.js
 * @author deo
 *
 * 
 */

var path = require('path');
var srcConfig = require('./src/config');

var config = {
    
    /** 
     * dev 开关
     * @params {boolean} true, false
     */
    debug: true,

    /** 
     * host
     * @params {string}
     */
    host: '127.0.0.1',

    /**
     * 监听端口
     * @params {number}
     */
    port: 8014,

    /**
     * publicPath
     * @params {string}
     */
    publicPath: '/',

    /**
     * mock 监听端口
     * @params {number}
     */
    mockPort: 8015

};

config.output = {

    /**
     * 打包输出位置
     * @params {string}
     */
     root: path.resolve('dist'),

    /**
     * 打包后的静态文件目录
     * @params {string}
     */
     assets: 'common'
};


config.srcDir = {

    /**
     * 项目源目录
     * @params {string} src | ''
     */
    // root: path.resolve(process.cwd(), 'src'),
    root: 'src',

    /**
     * 模板 源目录
     * @params {string}
     */
    // entry: 'entry',

    /**
     * js 源文件存放目录
     * @params {string}
     */
    // assets: 'static',

    /**
     * node 模块
     * @params {string}
     */
    nodeModules: '/node_modules'
};

config.extMap = {

    /**
     * js 后缀名 (js, jsx)
     * @params {string}
     */
    js: 'js',

    /**
     * 可以不写的已知后缀
     * @params {Array} ['', ...] 第一个默认的为必填
     */
    resolveExts: ['.tpl'],

    /**
     * 模板入口源文件后缀
     * @params {string}
     */
    srcTemplate: 'html',

    /**
     * 模板编译后的后缀
     * @params {string}
     */
    outputTemplate: 'html',
};

/**
 * webpack dev server 配置
 *
 */
config.devServer = {

    // dev 模式 静态入口文件访问位置
    contentBase: '',
    publicPath: config.publicPath,
    port: config.port,
    hot: true,
    historyApiFallback: true,
    noInfo: false,
    inline: true,
    stats: {
        cached: false,
        colors: true
    },

    /**
     * 本地项目用 https:// 访问项目
     * 同时需要 webpack dev server 进行 https 配置
     */
    https: false

    // webpack dev server source
    // options.https.key = options.https.key || fs.readFileSync(path.join(__dirname, "../ssl/server.key"));
    // options.https.cert = options.https.cert || fs.readFileSync(path.join(__dirname, "../ssl/server.crt"));
    // options.https.ca = options.https.ca || fs.readFileSync(path.join(__dirname, "../ssl/ca.crt"));

};

config.proxyPrefix = srcConfig.mock.proxyPrefix;
config.proxyPath = srcConfig.mock.proxyPath;

// 输出到其他物理目录
// config.output.root = 'D:\\output';

module.exports = config;
