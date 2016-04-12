/**
 * @file config.js
 * @author deo
 *
 * 
 */

var path = require('path');

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
    host: '172.16.1.169',

    /**
     * publicPath
     * @params {string}
     */
    publicPath: '',

    /**
     * 监听端口
     * @params {number}
     */
    port: 8014,

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
     assets: 'assets'
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
    resolveExts: ['.html'],

    /**
     * 模板源文件后缀
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
    }
};

// 输出到其他物理目录
// config.output.root = 'D:\\output';

module.exports = config;