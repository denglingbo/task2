/**
 * @file gulpfile.js
 * @author deo
 *
 * ----------------------------------------------
 * Demo
 * ----------------------------------------------
 *
 */

/* eslint-disable */

'use strict';

var gulp = require('gulp');

var config = require('./febd.config');
var MakeWebpackConfig = require('./make.webpack-config');
var febd = new MakeWebpackConfig(config);
// var webDevServer = require('webpack-dev-server');
// var connect = require('gulp-connect');

/**
 * 这里提供一个 node 的模拟转发
 */
var http = require('http');
var fs = require('fs');
var server = http.createServer(function (req, res) {
    var url = req.url;
    // console.log(url);
    res.writeHead(200, {
        'Content-Type': 'application/json',
        // 解决跨域
        'Access-Control-Allow-Origin': 'http://task2.test1.com:8014',
        // 前端使用 withCredentials: true 来模拟 cookie 传递，同时 Origin 不能用 *
        'Access-Control-Allow-Credentials': true
    });

    // var buffer = fs.readFileSync('./mock/data' + url + '.json');
    // res.end(JSON.stringify(JSON.parse(buffer)));

    res.end(JSON.stringify({
        status: 0,
        data: {
            key: 'Hello world'
        }
    }));

});
server.listen(9000);

// var https = require('https');

// var options = {
//     key: fs.readFileSync('./ssl/server-key.pem'),
//     ca: [fs.readFileSync('./ssl/ca-cert.pem')],
//     cert: fs.readFileSync('./ssl/server-cert.pem')
// };

// https.createServer(options,function(req,res){
//     res.writeHead(200);
//     res.end('hello world\n');
// }).listen(3000,'127.0.0.1');


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
    'mock',
    'dev-webpack'
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
