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
var config = require('./make.config');
var Webpacker = require('./tool/webpack-lib/index');

var dirMap = {
    root: path.join(__dirname, '/'),
    src: path.join(__dirname, '/src/'),
    dep: path.join(__dirname, '/dep/'),
    common: path.join(__dirname, '/src/common/')
};

// dev
gulp.task('dev', function () {

    var webpacker = new Webpacker(config, dirMap);
    
    webpacker.mockStart({
        mockDir: './mock',
        https: true
    });

    webpacker.devStart();
});