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

// var mockServer = require('gulp-mock-server');
// var webDevServer = require('webpack-dev-server');
var config = require('./febd.config');
var MakeWebpackConfig = require('./make.webpack-config');
var febd = new MakeWebpackConfig(config);
// var Febd = require('febd');
// var febd = new Febd(config);

/**
 * DEV - Mock
 * 模拟转发
 */
gulp.task('mock', function () {
    gulp.src('.', febd.mock());
});

/**
 * DEV
 * Webpack 打包
 * Web 服务器
 */
gulp.task('dev-webpack', function (callback) {

    febd.devStart(function (maker, webpack) {
        // setMaker(maker, webpack);
    });
});

// dev
gulp.task('dev', [
    'dev-webpack',
    'mock'
]);



/**
 * release
 * watcher
 */
var files = [
    'src/**/*.html',
    'src/**/*.tpl',
    'src/**/*.scss',
    'src/**/*.js'
];

gulp.task('watch', function () {

    gulp.watch(files, ['release-webpack']);
});

/**
 * release
 * webpack
 */
gulp.task('release-webpack', function (gulpCallback) {

    febd.build(gulpCallback, function (maker, webpack) {
        maker.setReleaseMock();
        // setMaker(maker, webpack);
    });
});

/**
 * release
 * connect
 */
gulp.task('connect', function () {

    febd.connect();
});

// release
gulp.task('release', [
    'release-webpack',
    'connect',
    'watch',
    'mock'
]);
