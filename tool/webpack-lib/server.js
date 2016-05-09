/* eslint-disable */

var _ = require('underscore');
var devServer = require('webpack-dev-server');
var webpack = require('webpack');

module.exports = function () {

    /**
     * webpack dev server 配置
     *
     */
    var serverConfig = {

        // dev 模式 静态入口文件访问位置
        contentBase: '',
        publicPath: this.config.publicPath,
        port: this.config.port,
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

    // var webpackConfig = this.MakeWebpackConfig(this.config);

    var compiler = webpack(this.webpackConfig);

    var server = new devServer(compiler, serverConfig);

    server.listen(this.config.port, this.config.host, function() {
        console.log('----- [server.js] webpack server start -----');
    });

    return server;
};
