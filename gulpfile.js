/**
 * @file gulpfile.js
 * @author deo
 *
 * ----------------------------------------------
 * Dev gulpfile
 * ----------------------------------------------
 */
/* eslint-disable */
'use strict';

var path = require('path');
var gulp = require('gulp');
// var mock = require('./tool/webpack-lib/mock');
var server = require('./tool/webpack-lib/server');
var mockServer = require('./tool/webpack-lib/deo-mock-server');
var webpack = require('webpack');

// Webapck utils
var Webpacker = require('./tool/webpack-lib/index');

var connect = require('gulp-connect');

var os = require('os');

var getIfs = function () {
    var osnet = os.networkInterfaces();
    return (osnet.en0 || osnet.eth0) || osnet['以太网'];
};

var getIp = function () {
    var ifsArr = getIfs();

    for (var i = 0; i < ifsArr.length; i++ ) {
        var ifs = ifsArr[i];
        if (/ipv4/i.test(ifs.family)) {
            return ifs.address;
        }
    }
};

/**
 * webpack config
 */
var config = {

    debug: true,

    // host: '127.0.0.1',
    host: getIp(),

    port: 8014,

    publicPath: '/',

    https: true
};

// mock
config.mock = {

    host: config.host,
    port: 8015,

    // proxyPrefix: null,
    // allowOrigin: 'https://task2.test1.com:8014'
    allowOrigin: 'https://' + config.host + ':' + config.port
};

var root = path.join(__dirname, '/');

/**
 * 开发环境
 */
gulp.task('dev', function () {

    // 启动 mock 服务
    mockServer('./mock', config.mock);

    config.debug = true;

    var webpacker = new Webpacker(config, root);

    webpacker.devStart();
});

/**
 * 模拟生产环境, NODE_ENV 非 pro，pro环境下，无 mock cordava.js
 */
gulp.task('test', function () {

    config.debug = false;

    var webpacker = new Webpacker(config, root);

    webpacker.testStart();
});







/**
 * 线上构建
 */
// var htmlmin = require('gulp-htmlmin');
// var clean = require('gulp-clean');

// gulp.task('build', function () {

//     config.debug = false;

//     var webpacker = new Webpacker(config, root);

//     // Run webpack
//     webpack(

//         // webpack config
//         webpacker.webpackConfig,

//         function (err, stats) {
//             if (err) {
//                 throw new gutil.PluginError('webpack', err);
//             }
//         }
//     );
// });

// //清理文件
// gulp.task('clean', function() {
//     return gulp.src(['dist'], {read:false})
//         .pipe(clean());
// });

// //预设任务
// gulp.task('default', function () {
//     gulp.start('build');
// });
