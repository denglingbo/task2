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

var os = require('os');
var ip;
var getIfs = function () {
    var osnet = os.networkInterfaces();
    return (osnet.en0 || osnet.eth0) || osnet['以太网'];
};
var ifsArr = getIfs();
for (var i = 0; i < ifsArr.length; i++ ) {
    var ifs = ifsArr[i];
    if (/ipv4/i.test(ifs.family)) {
        ip = ifs.address;
    }
}

/**
 * webpack config
 */
var config = {

    debug: true,

    host: '127.0.0.1',
    // host: ip,

    port: 8014,

    publicPath: '/',

    https: true
};

// mock
config.mock = {

    host: config.host,
    port: 8015,

    // proxyPrefix: null,
    allowOrigin: 'https://task2.test1.com:8014'
    // allowOrigin: 'https://' + config.host + ':' + config.port
};

var root = path.join(__dirname, '/');

mockServer('./mock', config.mock);

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
