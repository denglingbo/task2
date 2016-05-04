/**
 * @file editCommon.js
 * @author hefeng
 * 新建、编辑任务、事件、讨论的公共API
 *
 */
var util = require('common/util');
var attachMid = require('common/attachMid');
var editCom = {};

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
/**
 * 验证不通过弹窗
 *
 * @param {Array} arr, 需要弹窗提示的提示语集合
 *
 */
editCom.validAlert = function (arr) {
    var me = this;
    var $alertDom = $('.alert-length-limit');
    var len = arr.length;
    var time = 0;
    if (len > 1) {
        $alertDom.text(arr[0]).removeClass('hide');
        time = 3000;
    }
    else if (len === 1) {
        $alertDom.text(arr[0]).removeClass('hide');
        time = 3000;
    }
    else {
        return;
    }
    setTimeout(function () {
        $alertDom.addClass('hide');
        arr.shift()
        me.validAlert(arr);
    },
    time);
};

/**
 * 取消确认是否编辑过, 是否离开弹窗
 *
 * @param {Object} validObj, 验证信息对象
 *
 */
editCom.cancelValidate = function (validObj) {
    if(validObj.isEdit) {
        var cancelButton = {
            title: '取消',
            callback: function () {

            }
        };

        var OKButton = {
            title: '确认',
            callback: function () {

            }
        };
        CPUtils.showAlertView('', '确认放弃当前添加的内容', cancelButton, OKButton);
    }
};

/**
 * bind 文本框获得焦点事件
 *
 */
editCom.bindGetFocus = function () {
    $('.edit-title-wrap').on('click', function () {
        $('#edit-title').focus();
    });

    $('.edit-words').on('click', function () {
        $('#edit-content').focus();
    });
};

/**
 * 提交前验证
 *
 * @param {Function} submitFn, 提交到后端的函数
 * @param {Object} validObj, 验证信息对象
 *
 */
editCom.submitValid = function (submitFn, validObj) {
    var flag = validObj.title && validObj.content && validObj.isAttachesReady;
    var arr = [];
    if (flag) {
       submitFn(); 
    }
    else {
        if (!validObj.title) {
            if(!$('#edit-title').val()) {
                arr.push('标题不能为空');
            }
            else {
                arr.push('标题不能超过50字');
            }
        }

        if (!validObj.content) {
            arr.push('输入内容不能超过5万字');
        }

        if (!validObj.isAttachesReady) {
            arr.push('附件尚未传输完毕');
        }
    }
    this.validAlert(arr);
};

/**
 * 验证是否能提交，进行最后的验证
 *
 * @param {Object} title, 标题的phoneInput对象
 * @param {Object} content, 描述的phoneInput对象
 * @param {Object} attach, 附件对象
 * @param {Object} validObj, 验证信息
 */
editCom.setValidObj = function (title, content, attach, validObj) {
    validObj.content = content.isAllowSubmit();
    validObj.title = title.isAllowSubmit() && $('#edit-title').text();
    validObj.isAttachesReady = attach.isAttachesReady();
};

/**
 * 初始化紧急程度mobiscroll
 *
 * @param {string} selector, 选择器字符串
 * @param {Object} infoData, 初始化参数
 * @param {Object} validObj, 提交验证信息
 */
editCom.initImportanceLevel = function (selector, infoData, validObj) {
    var data = {
        headerText: '紧急程度',
        showInput: false,
        showMe: true,
        rows: 3,
        data: [
            {
                text: '重要且紧急',
                value: 4
            },
            {
                text: '普通',
                value: 1,
                selected: true
            },
            {
                text: '重要',
                value: 2
            },
            {
                text: '紧急',
                value: 3
            }
        ],
        onSelect: function (text, inst) {
            /* eslint-disable */
            infoData['importance_level'] = +inst.getVal();
            /* eslint-enable */
            $(selector + ' .value').text(text);

            validObj.isEdit = true;
        }
    };
    this.initMobiscroll('select', selector, data);
};

/**
 * 初始化新建、编辑页面附件
 *
 * @param {string} selector, 选择器字符串
 * @param {Object} attachData, 附件信息
 * @param {Object} validObj, 提交验证信息
 * @return {Object} 附件对象
 */
editCom.initEditAttach = function (selector, attachData, validObj) {
    var attachOptions = {
        dom: {
            // 附件容器DOM元素
            containerDOM: '#attachList',
            addBtnDOM: '#addAttach'
        },
        operateType: 'upload',
        callback: function () {
            validObj.isEdit = true;
        }
    };
    var attachObj = attachMid.initAttach(attachOptions, util.transKey(attachData), selector);
    return attachObj;
};

/**
 * 初始化mobiscroll
 *
 * @param {string} method, 初始化mobiscroll的种类
 * @param {string} selector, 选择器字符串
 * @param {Object} data, 初始化参数
 */
editCom.initMobiscroll = function (method, selector, data) {
    $(selector).mobiscroll()[method]($.extend({}, mobiOptions, data));
};

/**
 * 初始化完成时间填充字符串
 *
 * @param {time} time, 毫秒时间
 * @return {string} 返回初始化的时间字符串
 */
editCom.initDoneTime = function (time) {
    return time ? util.formatTime(time) : '尽快完成';
}

/**
 * 初始化完成紧急程度填充字符串
 *
 * @param {number} level, 重要程度数字表示
 * @return {string} 重要程度字符串表示
 */
editCom.initImportValue = function (level) {
    var importanceLevel = ['普通', '重要', '紧急', '重要且紧急'];
    return importanceLevel[level - 1];
}

module.exports = editCom;
