/**
 * @file config.js
 * @author deo
 * 前端请求配置
 */
var config = {

    debug: true,

    API: {
        // 用于发送异步请求
        host: 'https://web.jingoal.com',

        prefix: '/task/m/v1/',

        HOME_URL: 'index',

        // 列表页，未完成
        LIST_URL: 1001,
        // 列表页，已完成
        LIST_DONE_URL: 1002,
        // 列表页，已撤销
        LIST_CANCEL_URL: 1003,

        // 事件详情
        AFFAIR_DETAIL_URL: 'get_affair_detail',

        // 加载更多事件和讨论
        AFFAIR_TALK_MORE_URL: 'get_task_slaves',

        // 任务详情
        TASK_DETAIL_URL: 'get_task_detail',
        // 添加关注
        TASK_FOLLOW: 'attention_task',

        // 任务新建
        TASK_NEW_URL: 'create_task',
        // 事件新建
        AFFAIR_NEW_URL: 'create_affair',
        // 讨论新建
        TALK_NEW_URL: 'create_affair_comment',

        // 任务编辑
        TASK_EDIT_URL: 'update_task',
        // 事件编辑
        AFFAIR_EDIT_URL: 'update_affair',
        // 讨论编辑
        TALK_EDIT_URL: 'update_affair_comment',

        // 讨论
        TALK_DETAIL_URL: 'get_talk_detail',

        // attach uploadUrl
        ATTACH_UPLOADURL: '/task/m/v1/attachment/getFSTokensOnCreate',
        // attach resumeUrl
        ATTACH_RESUMEURL: '/task/m/v1/attachment/getFSTokensOnContinue'
    }
};

/**
 * 静态参数
 */
config.const = {
    TASK_PARAMS: 'TASK_PARAMS'
};

// 以下参数 febd.config.js & page.js 使用
// 联调环境的时候，需要先在联调环境登录 [DHC]，并且把 token 保存，才可以在和后端握手的时候确认身份
config.mock = {

    // 这个需要通过
    token: '2a2e2cf3-3125-4278-be67-ecae6aac0753',

    // mock 代理服务不要最后的 '/'
    // proxyPrefix: '/api',

    // target: 'http://task2.test1.com:8015/data/'
    // target: 'http://web.test1.com/task/m/v1/'
    // proxyPath: config.API.host + config.API.prefix
};


// debug 模式
// 如果 mock.proxyPrefix 和 API.prefix 指向同一个 路由，则代表需要进行转发
// prefix = '/data/' 为前端本地开发调试使用
if (config.debug) {

    config.API.host = document.location.protocol + '//task2.test1.com:8015';
    // config.API.host = 'https://web.test1.com';

    // 直接走 mock server
    config.API.prefix = '/data/';

    // 通过 mock server [node] 转发
    // config.API.prefix = '/api/';

    // 后端联调位置
    // config.mock.proxyPath = 'http://web.test1.com' + config.API.prefix;
    // config.mock.proxyPath = 'http://172.16.1.108:8080/task/m/v1/';

    // node 端代理转发地址 本地模拟转发
    // config.mock.proxyPath = 'http://task2.test1.com:9000'

    // 这是有历史意义的 一次尝试
    // config.mock.proxyPath = 'https://127.0.0.1:3000';
    // config.mock.proxyPath = 'https://web.test1.com/task/m/v1/';
}

module.exports = config;
