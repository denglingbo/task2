/**
 * @file attachWraper.js
 * @author hefeng
 * 组件调用公共API
 *
 */
require('dep/plugins/attaches/css/attaches.css');
var Mustache = require('dep/mustache');
// attaches 需要使用
window.Mustache = Mustache;
require('dep/plugins/attaches/attaches');
var localstorage = require('common/localstorage');
var config = require('config');
var util = require('common/util');

var clientMsg = (function () {
    var data = localstorage.getData('TASK_PARAMS');

    if (!data) {
        return;
    }

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
            url: config.API.ATTACH_UPLOADURL,
            mothod: 'POST'
        },
        resumeUrl: {
            url: config.API.ATTACH_RESUMEURL,
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
            4
        ]
    },
    download: {}
};

var attach = {};

/**
 * 初始化attach
 *
 * @param {Object} options, 初始化附件参数
    // options {dom: {containerDOM: selector, addBtnDOM: selector}, operateType: '', callback: function}
                                               添加附件按钮         upload|download
 * @param {Array} attachData, 附件数据, 需转驼峰
 * @param {string} containerSelector, 添加附件的容器
 * @return {Object} 附件对象
 */
attach.initAttach = function (options, attachData) {
    attachData = attachData || {};
    var attachOptions = $.extend(
        {originAttaches: attachData},
        attachOption,
        methodOption[options.operateType],
        options
    );
    // 初始化附件组件
    /* eslint-disable */
    var attachObj = new Attach(attachOptions);
    var renderString = Attach.getRenderString({attach: attachData}, attachOptions.clientMsg.appver);

    $(options.dom.containerDOM).append(renderString.attach);
    Attach.initEvent(options.dom.containerDOM, attachOptions.clientMsg.lang);
    /* eslint-enable */
    return attachObj;
};

/**
 * 初始化附件
 *
 * @param {Object} options, 配置参数
 *      // {Object} attachData, 附件数据
 *      // {string} container, 容器选择器, 必传
 *      // {string} addBtn, 添加附件选择器, 没有则是查看附件
 *      // {string} wrapper, 附件的最外层容器, 不传参则不隐藏最外层容器, 下方附件列表位置显示提示文字
 *      // {Function} callback, 回掉函数
 * @return {Object}, 附件对象
 */
attach.initDetailAttach = function (options) {
    var me = this;
    if (!options.addBtn && (!options.attachData || options.attachData.length < 1)) {
        if (options.wrapper) {
            $(options.wrapper).addClass('hide');
        }
        else {
            $(options.container).html('<div class="no-attach">无附件</div>');
        }
        return;
    }
    // 初始化附件组件
    var attachOptions = {
        dom: {
            // 附件容器DOM元素
            containerDOM: options.container,
            addBtnDom: options.addBtn
        },
        operateType: options.addBtn ? 'upload' : 'download',
        callback: options.callback
    };

    var attachObj = me.initAttach(attachOptions, util.transKey(options.attachData));
    return attachObj;
};

module.exports = attach;