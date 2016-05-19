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

// Webapck utils
var Webpacker = require('./tool/webpack-lib/index');

var connect = require('gulp-connect');

/**
 * webpack config
 */
var config = {

    debug: true,

    host: '127.0.0.1',

    port: 8014,

    publicPath: '/',

    https: true,

    // mock
    mock: {

        port: 8015,

        proxyPrefix: null,
        proxyPath: null
    }
};

var root = path.join(__dirname, '/');

mockServer('./mock');

/**
 * 开发环境
 */
gulp.task('dev', function () {

    config.debug = true;

    var webpacker = new Webpacker(config, root);
    
    // webpacker.mockStart({
    //     mockDir: './mock',
    //     https: config.https
    // });

    webpacker.devStart();
});

/**
 * 模拟生产环境, NODE_ENV 非 pro，pro环境下，无 mock cordava.js
 */
gulp.task('test', function () {

    config.debug = false;

    var webpacker = new Webpacker(config, root);
    
    // webpacker.mockStart({
    //     mockDir: './mock',
    //     https: config.https
    // });

    webpacker.testStart();
});
