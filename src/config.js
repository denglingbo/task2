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
        LIST_MORE_URL: 1002
    }
};

config.mockUrl = 'http://172.16.1.169:8015';

config.const = {
    loader: {
        'doing': '加载中',
        'done': '加载完成',
        'default': '加载更多'
    }
};

module.exports = config;
