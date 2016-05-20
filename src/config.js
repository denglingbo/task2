/**
 * @file config.js
 * @author deo
 * 前端请求配置
 */
var config = {

    debug: true,

    API: {
        // 用于发送异步请求
        host: document.location.protocol + '//web.test1.com',

        prefix: '/task/m/v1/',

        HOME_URL: 'get_home_remind',

        // 列表页，未完成
        LIST_URL: 1001,
        // 列表页，已完成
        LIST_DONE_URL: 1002,
        // 列表页，已撤销
        LIST_CANCEL_URL: 1003,

        // 任务详情
        TASK_DETAIL_URL: 'get_task_detail',
        // 添加关注
        TASK_FOLLOW: 'attention_task',
        // 任务新建
        TASK_NEW_URL: 'create_task',
        // 任务编辑
        TASK_EDIT_URL: 'update_task',
        // 任务总结
        SUMMARY_TASK: 'summary_task',
        // 任务撤销
        REVOKE_TASK: 'revoke_task',
        // 任务拒绝
        REFUSE_TASE: 'refuse_task',
        // 任务同意
        AUDIT_TASK: 'audit_task',

        // 事件详情
        AFFAIR_DETAIL_URL: 'get_affair_detail',
        AFFAIR_DONE: 'finish_affair',
        AFFAIR_RESUME: 'recovery_affair',
        AFFAIR_COMMENT_DELETE: 'delete_affair_comment',
        AFFAIR_COMMENT_ADD: 'add_affair_comment',
        // 加载更多事件和讨论
        AFFAIR_TALK_MORE_URL: 'get_task_slaves',
        // 事件新建
        AFFAIR_NEW_URL: 'create_affair',
        // 事件编辑
        AFFAIR_EDIT_URL: 'update_affair',
        // 事件评论列表
        AFFAIR_COMMENT_LIST: 'get_affair_comment_list',
        GET_AFFAIR_TAGS: 'get_affair_tags',

        // 讨论编辑
        TALK_EDIT_URL: 'update_talk',
        // 讨论
        TALK_DETAIL_URL: 'get_talk_detail',
        // 讨论新建
        TALK_NEW_URL: 'create_talk',
        TALK_DONE: 'close_talk',
        TALK_RESUME: 'resume_talk',
        TALK_COMMENT_DELETE: 'delete_talk_comment',
        TALK_COMMENT_ADD: 'add_talk_comment',
        // 讨论评论列表
        TALK_COMMENT_LIST: 'get_talk_comment_list',

        // attach uploadUrl
        ATTACH_UPLOADURL: 'attachment/get_fs_tokens_on_create',
        // attach resumeUrl
        ATTACH_RESUMEURL: 'attachment/get_fs_tokens_on_continue'
    }
};

/**
 * 静态参数
 */
config.const = {
    TASK_PARAMS: 'TASK_PARAMS',
    TASK_CACHE: 'TASK_CACHE'
};

// 以下参数 febd.config.js & page.js 使用
// 联调环境的时候，需要先在联调环境登录 [DHC]，并且把 token 保存，才可以在和后端握手的时候确认身份
config.mock = {

    // 这个需要通过
    token: 'f9794f08-75f0-4368-8005-af865f256b84'
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
    // 联调地址
    // config.API.host = document.location.protocol + '//web.test1.com';

    // 直接走 mock server
    // config.API.host = document.location.protocol + '//task2.test1.com:8015';
    // config.API.prefix = '/data/';
}

module.exports = config;
