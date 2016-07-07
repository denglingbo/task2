/**
 * @file attachWraper.js
 * @author hefeng
 * 组件调用公共API
 *
 */
require('dep/ui/attaches/css/attaches.css');
require('dep/touch');
var Mustache = require('dep/mustache');
// attaches 需要使用
window.Mustache = Mustache;
require('dep/ui/attaches/attaches');
var localstorage = require('common/localstorage');
var config = require('config');
var lang = require('common/lang').getData();

var clientMsg = (function () {
    var data = localstorage.getData(config.const.PARAMS);

    if (!data) {
        return;
    }

    return {
        uid: data.uid,
        cid: data.cid,
        client: data.client,
        lang: data.lang,
        puse: data.puse,
        appver: data.appver
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
    }
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
 * 初始化上传attach
 *
 * @param {Object} options, 初始化附件参数
    // options {dom: {containerDOM: selector, addBtnDOM: selector}, operateType: '', callback: function}
                                               添加附件按钮
 * @param {Array} attachData, 附件数据
 * @param {string} containerSelector, 添加附件的容器
 * @return {Object} 附件对象
 */
attach.initAttach = function (options, attachData) {
    var attachLength = 10;
    if (attachData && $.isArray(attachData)) {
        attachLength += attachData.length;
    }
    var attachOptions = {
        originAttaches: (attachData || []),
        dom: {
            // 附件容器DOM元素
            containerDOM: options.container,
            addBtnDOM: options.addBtn
        },
        operateType: 'upload',
        attachesCount: attachLength,
        callback: options.callback
    };
    $.extend(
        attachOptions,
        attachOption,
        methodOption[attachOptions.operateType]
    );
    // 初始化附件组件
    /* eslint-disable */
    var attachObj = new Attach(attachOptions);
    /* eslint-enable */
    var renderString = attachObj.getRenderString();

    $(attachOptions.dom.containerDOM).append(renderString);

    attachObj.initEvent();

    return attachObj;
};

/**
 * 初始化查看附件
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
    // var me = this;
    if (!options.addBtn && (!options.attachData || options.attachData.length < 1)) {
        if (options.wrapper) {
            $(options.wrapper).addClass('hide');
        }
        else {
            $(options.container).html('<div class="no-attach">' + lang.noAttach + '</div>');
        }
        return;
    }

    $(options.wrapper).removeClass('hide');

    options.attachData = options.attachData ? options.attachData : [];
    // 初始化附件组件
    var attachOptions = {
        dom: {
            // 附件容器DOM元素
            containerDOM: options.container,
            addBtnDom: options.addBtn
        },
        operateType: 'download',
        callback: options.callback
    };
    $.extend(
        attachOptions,
        attachOption,
        methodOption[attachOptions.operateType]
    );
    /* eslint-disable */
    var attachObj = new Attach(attachOptions);
    var renderString = Attach.getRenderString({
        attach: options.attachData
    }, attachOptions.clientMsg.appver);
    $(attachOptions.dom.containerDOM).append(renderString.attach);
    Attach.initEvent(attachOptions.dom.containerDOM, attachOptions.clientMsg.lang);
    return attachObj;
    /* eslint-enable */
};

module.exports = attach;
