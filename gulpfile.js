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
var mock = require('./tool/webpack-lib/mock');
var server = require('./tool/webpack-lib/server');

// Webapck utils
var Webpacker = require('./tool/webpack-lib/index');


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

// dev
gulp.task('dev', function () {

    var webpacker = new Webpacker(config, root);
    
    webpacker.mockStart({
        mockDir: './mock',
        https: true
    });

    webpacker.devStart();
});