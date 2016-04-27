/**
 * @file config.js
 * @author deo
 * 前端请求配置
 */
var config = {

    debug: true,

    API: {
        HOME_URL: 1000,

        // 列表页，未完成
        LIST_URL: 1001,
        // 列表页，已完成
        LIST_DONE_URL: 1002,
        // 列表页，已撤销
        LIST_CANCEL_URL: 1003,

        // 事件详情
        AFFAIR_DETAIL_URL: 1005,
        // 加载更多事件和讨论
        AFFAIR_TALK_MORE_URL: 3005,

        // 任务详情
        TASK_DETAIL_URL: 1004,
        // 任务编辑
        TASK_EDIT_URL: 2000,

        // 讨论
        DISCUSSION_DETAIL_URL: 5001
    }
};

config.const = {

    TASK_PARAMS: 'TASK_PARAMS',

    loader: {
        'doing': '加载中',
        'done': '加载完成',
        'default': '加载更多'
    }
};

var host = '172.16.1.209';
// var host = 'localhost';
// var host = '172.16.1.101';
// var host = '192.168.1.5';

config.mockUrl = 'http://' + host + ':8015';

module.exports = config;
