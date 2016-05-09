/* eslint-disable */

var _ = require('underscore');
var devServer = require('webpack-dev-server');
var webpack = require('webpack');

var config = require('../config');
var MakeWebpackConfig = require('../make.webpack');

/**
 * webpack dev server 配置
 *
 */
var serverConfig = {

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
    https: true

    // webpack dev server source
    // options.https.key = options.https.key || fs.readFileSync(path.join(__dirname, "../ssl/server.key"));
    // options.https.cert = options.https.cert || fs.readFileSync(path.join(__dirname, "../ssl/server.crt"));
    // options.https.ca = options.https.ca || fs.readFileSync(path.join(__dirname, "../ssl/ca.crt"));

};

var server = function (options) {

    _.extend(config, options);

    var webpackConfig = MakeWebpackConfig(config);
console.log(webpackConfig)
    var compiler = webpack(webpackConfig);
return;
    var server = new devServer(compiler, serverConfig);

    server.listen(config.port, config.host, function() {
        console.log('----- [server.js] webpack server start -----');
    });

    return server;
};

var dev = function () {
    
    return server({
        debug: true
    });
};

var release = function () {

    return server({
        debug: false
    });
};


dev();

module.exports = {
    server: server,
    dev: dev,
    release: release
};