/**
 * @file config.js
 * @author deo
 * 前端请求配置
 */
var config = {

    debug: true,

    API: {

        host: 'http://localhost:8015',

        prefix: '/task/m/v1/',
        // prefix: '/task/m/v1/',
        // http://[host]/task/m/v1/get_task_detail?task_id=69585
        // http://[host]/task/m/v1/get_talk_list?task_id=69585&title&talk_status=0&curr_page=1&number=15&sort_type=0&show_finish=0
        // get_task_detail --> 之后用更改 1000

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
        TASK_DETAIL_URL: 'get_task_detail',

        // 任务编辑
        TASK_EDIT_URL: 2000,
        // 事件编辑
        AFFAIR_EDIT_URL: 2001,
        // 讨论编辑
        TALK_EDIT_URL: 2002,

        // 讨论
        TALK_DETAIL_URL: 5001
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

if (config.debug) {
    config.API.prefix = '/';
}

module.exports = config;
