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

// attach 公共参数
var attachOption = {
    // 客户端信息
    // clientMsg: {
    //     uid: '1',
    //     cid: '1',
    //     client: '',
    //     lang: '',
    //     pause: '',
    //     appver: '111.1.1'
    // },
    // 已经有的附件信息，没有传空数组，这个主要是用于修改
    // originAttaches:[],
    // url: {
    //     uploadUrl: {
    //         url: '/mgw/approve/attachment/getFSTokensOnCreate',
    //         mothod: 'POST'
    //     },
    //     resumeUrl: {
    //         url: '/mgw/approve/attachment/getFSTokensOnContinue',
    //         mothod: 'POST'
    //     }
    // },
    // supportType: [
    //     // 本地文件
    //     1,
    //     // 网盘文件
    //     2,
    //     // 相册图片
    //     3,
    //     // 拍照上传
    //     4,
    //     // 语音上传
    //     5
    // ],
    // dom: {
    //     // 附件容器DOM元素
    //     containerDOM: '#attachList',
    //     addBtnDOM: '#addAttach'
    // },
    // operateType: 'upload',
    // attachesCount: 10,
    // callback: function () {}
};

/**
 * 初始化attach
 *
 * @param {Object} options, 初始化附件参数
 * @param {Array} attachData, 附件数据
 * @param {string} containerSelector, 添加附件的容器
 *
 */
exports.initAttach = function (options, attachData, containerSelector) {
    var attachOptions = $.extend({}, attachOption, options);
    // 初始化附件组件
    /* eslint-disable */
    var attach = new Attach(attachOptions);
    var renderString = Attach.getRenderString({attach: attachData}, attachOptions.clientMsg.appver);

    $(containerSelector).append(renderString.attach);
    Attach.initEvent(containerSelector, 'zh_CN');
    /* eslint-enable */
};

module.exports = exports;
