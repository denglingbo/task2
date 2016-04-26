/**
 * I am tester
 *
 */
var webpack = require('webpack');
var config = require('./febd.config');
var MakeWebpackConfig = require('./make.webpack-config');

config.debug = false;

var makeWebpackConfig = new MakeWebpackConfig(config);

makeWebpackConfig.init();

var path = require('path');
var depDir = path.join(__dirname, '/dep/');

var setMaker = function (maker, webpack) {

    maker.setAlias({
        zepto: depDir + 'zepto',
        dep: depDir
    });

    maker.addLoaders(
        {
            // 模板 加载器
            // Reference: https://github.com/webpack/ejs-loader
            test: /\.tpl$/,
            loader: 'mustache'
        }
    );

    // maker.clearPlugins();
    maker.addPlugins([
        new webpack.ProvidePlugin({
            $: 'zepto'
        })
    ]);
};

setMaker(makeWebpackConfig, webpack);

var webpackConfig = makeWebpackConfig.get();

module.exports = webpackConfig;
