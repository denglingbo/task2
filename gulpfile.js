/**
 * @file gulpfile.js
 * @author deo
 *
 * ----------------------------------------------
 * Demo
 * ----------------------------------------------
 *
 */
'use strict';

var gulp = require('gulp');

var mockServer = require('gulp-mock-server');
var webDevServer = require('webpack-dev-server');

var config =require('./febd.config');
var MakeWebpackConfig = require('./make.webpack-config');

var febd = new MakeWebpackConfig(config);
// var Febd = require('febd');
// var febd = new Febd(config);

var path = require('path');
var depDir = path.join(__dirname, '/dep/');
var pageDir = path.join(__dirname, '/entry/');

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

/**
 * DEV - Mock
 * 模拟转发
 */
gulp.task('mock', function() {
    gulp.src('/api', febd.mock());
});

/** 
 * DEV
 * Webpack 打包
 * Web 服务器
 */
gulp.task('dev-webpack', function (callback) {

    febd.devStart(function (maker, webpack) {
        setMaker(maker, webpack);
    });
});

// dev
gulp.task('dev', [
    'dev-webpack',
    'mock'
]);