/**
 * @file
 * @author
 *
 */
/* eslint-disable */
var config = require('../config');
var mockServer = require('gulp-mock-server');

var mockConfig = {
    host: '127.0.0.1',
    port: 8015,
    path: '/',
    mockDir: '../mock',
    // https: false,
    // https: true,

    /**
     * 当后端联调环境为 https 的接口
     * @require 服务端 key.pem
     * @require 服务端 cert.pem
     */
    https: {
        // key: './ssl/keys/server-key.pem',
        // cert: './ssl/keys/server-cert.pem'
        // ca: './ssl/dev/ca.crt'
        key: config.https.key || './ssl/server.key',
        cert: config.https.cert || './ssl/server.crt'
    },
    directoryListing: true,
    proxies: [
        {
            source: config.proxyPrefix,
            target: config.proxyPath
        }
    ],

    // liveerload = true, https 配置才有用
    livereload: true
};

console.log('----- [mock.js] -----')
console.log(mockConfig);

return mockServer(mockConfig);