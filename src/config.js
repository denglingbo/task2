/**
 * @file config.js
 * @author deo
 * 前端请求配置
 */
var config = {

    VERSION: '1',

    debug: false,

    API: {
        // 用于发送异步请求
        host: document.location.protocol + '//web.test1.com',

        prefix: '/mgw/task/v1/',

        HOME_URL: 'getHomeRemind',
        DOCK_REMIND: 'getDockRemind',

        // 任务详情
        TASK_DETAIL_URL: 'getTaskDetail',
        // 任务附件列表
        ATTACH_LIST: 'getDocumentList',
        // 添加关注
        TASK_FOLLOW: 'attentionTask',
        // 任务新建
        TASK_NEW_URL: 'createTask',
        // 任务编辑
        TASK_EDIT_URL: 'updateTask',
        // 接收任务
        TASK_RECEIVE: 'receiveTask',
        // 恢复任务
        TASK_RECOVER: 'recoverTask',
        // 总结详情
        TASK_SUMMARY_GET: 'getTaskSummary',
        // 任务完成
        COMPLETE_TASK: 'completeTask',
        // 任务撤销
        REVOKE_TASK: 'revokeTask',
        // 任务拒绝
        REFUSE_TASE: 'refuseTask',
        // 任务同意
        AUDIT_TASK: 'auditTask',

        // 事件详情
        AFFAIR_DETAIL_URL: 'getAffairDetail',
        AFFAIR_DONE: 'finishAffair',
        AFFAIR_RESUME: 'recoveryAffair',
        AFFAIR_COMMENT_DELETE: 'deleteAffairComment',
        AFFAIR_COMMENT_ADD: 'addAffairComment',
        // 加载更多事件和讨论
        AFFAIR_TALK_MORE_URL: 'getTaskSlaves',
        // 事件新建
        AFFAIR_NEW_URL: 'createAffair',
        // 事件编辑
        AFFAIR_EDIT_URL: 'updateAffair',
        // 事件评论列表
        AFFAIR_COMMENT_LIST: 'getAffairCommentList',
        GET_AFFAIR_TAGS: 'getAffairTags',

        // 讨论编辑
        TALK_EDIT_URL: 'updateTalk',
        // 讨论
        TALK_DETAIL_URL: 'getTalkDetail',
        // 讨论新建
        TALK_NEW_URL: 'createTalk',
        TALK_DONE: 'closeTalk',
        TALK_RESUME: 'resumeTalk',
        TALK_COMMENT_DELETE: 'deleteTalkComment',
        TALK_COMMENT_ADD: 'addTalkComment',
        // 讨论评论列表
        TALK_COMMENT_LIST: 'getTalkCommentList',
        // 总结详情
        TALK_SUMMARY_GET: 'getTalkSummary',
        TALK_SUMMARY: 'summaryTalk',

        // 列表
        // 任务列表
        GET_TASK_LIST: 'getTaskList',
        GET_TALK_LIST: 'getTalkList',
        GET_AFFAIR_LIST: 'getAffairList',
        SEARCH_TASK: 'searchTask'
    }
};

// attach uploadUrl

/**
 * [重要] 目前上传等和以前组件相关的因为没有自动拼装 ajax url, 所以这里要写完整
 */
config.API.ATTACH_UPLOADURL = config.API.host + '/mgw/common/attachment/getFSTokensOnCreate';
// attach resumeUrl
config.API.ATTACH_RESUMEURL = config.API.host + '/mgw/common/attachment/getFSTokensOnContinue';

/**
 * 公用参数
 */
config.const = {

    // localstorage 公用参数
    PARAMS: 'TASK_PARAMS',

    // local database
    DATABASE_NAME: 'TASK_DATABASE'
};

// 以下参数 febd.config.js & page.js 使用
// 联调环境的时候，需要先在联调环境登录 [DHC]，并且把 token 保存，才可以在和后端握手的时候确认身份
config.mock = {

    // 这个需要通过
    token: 'a38cef12-fcac-4458-a8d2-58c15226276a-291506'
    // mock 代理服务不要最后的 '/'
    // proxyPrefix: '/api',

    // target: 'http://task2.test1.com:8015/data/'
    // target: 'http://web.test1.com/task/m/v1/'
    // proxyPath: config.API.host + config.API.prefix
};

/* eslint-disable */
// debug 模式
// 如果 mock.proxyPrefix 和 API.prefix 指向同一个 路由，则代表需要进行转发
// prefix = '/data/' 为前端本地开发调试使用

// config.debug = true;

if (config.debug) {
    var loc = window.location;

    // 直接走 mock server

    // config.API.host = document.location.protocol + '//task2.test1.com:8015';
    config.API.host = loc.protocol + '//' + loc.hostname + ':8015';
    config.API.prefix = '/data/';
}
/* eslint-enable */

module.exports = config;
