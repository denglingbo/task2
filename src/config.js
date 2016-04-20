/**
 * @file config.js
 * @author deo
 * 前端请求配置
 */
var config = {

    debug: true,

    API: {
        HOME_URL: 1000,
        LIST_URL: 1001,
        LIST_DONE_URL: 1002,
        LIST_CANCEL_URL: 1003
    }
};

// var host = 'localhost';
var host = '172.16.1.218';
// var host = '192.168.1.5';

config.mockUrl = 'http://' + host + ':8015';

config.const = {
    loader: {
        'doing': '加载中',
        'done': '加载完成',
        'default': '加载更多'
    }
};

module.exports = config;
