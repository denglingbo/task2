/**
 * @file plugins.js
 * @author hefeng
 * 组件调用公共API
 *
 */

var Mustache = require('dep/mustache');
// attaches 需要使用
window.Mustache = Mustache;
require('dep/plugins/attaches/attaches');
var localstorage = require('common/localstorage');
// mobiscroll 公共参数
var mobiOptions = {
    theme: 'android-holo-light',
    mode: 'scroller',
    // ios 底部上滑, android 中间显示
    display: (/(iphone|ipad)/i).test(navigator.appVersion) ? 'bottom' : 'modal',
    lang: 'zh',
    buttons: ['cancel', 'set'],
    height: 50
};
var clientMsg = (function () {
    var data = localstorage.getData('TASK_PARAMS');
    return {
        uid: data.uid,
        cid: data.cid,
        client: data.client,
        lang: data.lang,
        puse: data.puse,
        appver: data.appver || '111.1.1'
    };
})();
// attach 公共参数
var attachOption = {
    // 客户端信息
    clientMsg: clientMsg,
    url: {
        uploadUrl: {
            url: '/mgw/approve/attachment/getFSTokensOnCreate',
            mothod: 'POST'
        },
        resumeUrl: {
            url: '/mgw/approve/attachment/getFSTokensOnContinue',
            mothod: 'POST'
        }
    },
    attachesCount: 10
};

var methodOption = {
    upload: {
        supportType: [
        // 本地文件
            1,
            // 网盘文件
            2,
            // 相册图片
            3,
            // 拍照上传
            4,
            // 语音上传
            5
        ]
    },
    download: {}
};

/**
 * 初始化attach
 *
 * @param {Object} options, 初始化附件参数
 * @param {Array} attachData, 附件数据
 * @param {string} containerSelector, 添加附件的容器
 * @return {Object} 附件对象
 */
exports.initAttach = function (options, attachData, containerSelector) {
    var attachOptions = $.extend({}, attachOption, methodOption[options.operateType], options);
    // 初始化附件组件
    /* eslint-disable */
    var attach = new Attach(attachOptions);
    var renderString = Attach.getRenderString({attach: attachData}, attachOptions.clientMsg.appver);

    $(containerSelector).append(renderString.attach);
    Attach.initEvent(containerSelector, 'zh_CN');
    /* eslint-enable */
    return attach;
};

/**
 * 初始化mobiscroll
 *
 * @param {string} method, 初始化mobiscroll的种类
 * @param {string} selector, 选择器字符串
 * @param {Object} data, 初始化参数
 */
exports.initMobiscroll = function (method, selector, data) {
    $(selector).mobiscroll()[method]($.extend({}, mobiOptions, data));
};

module.exports = exports;
