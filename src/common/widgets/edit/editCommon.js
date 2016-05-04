/**
 * @file new.js
 * @author hefeng
 * 新建、编辑任务、事件、讨论的公共API
 *
 */
var util = require('common/util');
var attach = require('common/attach');
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
 * 切换关闭按钮的显示与隐藏
 *
 * @param {string} id, 当前输入框的id
 * @param {number} textLength, 输入框内文字长度
 *
 */
editCom.toggleX = function (id, textLength) {
    var $close = $('.' + id + '-wrap .close-x');
    if (!textLength) {
        $close.addClass('hide');
    }
    else {
        $close.removeClass('hide');
    }
};

/**
 * bind 文本框的清除按钮
 *
 * @param {Object} validObj, 验证信息对象
 *
 */
editCom.bindTitleClear = function (validObj) {
    $('.edit-title-wrap .close-x').on('click', function () {
        var $parentDom = $(this).parent();
        var $textDom = $('#edit-title');
        if ($textDom.val().length) {
            validObj.isEdit = true;
        }
        $textDom.val('');
        $parentDom.find('.err-tip').text('');
        $(this).addClass('hide');
        validObj.title = false;
    });
};

/**
 * bind title文本框的事件
 *
 * @param {Object} validObj, 验证信息对象
 *
 */
editCom.bindTitle = function (validObj) {
    var me = this;
    $('#edit-title').on('input propertychange', function () {
        var length = $(this).val().length;
        var errTip = $(this).next('.err-tip');
        validObj.isEdit = true;

        me.toggleX('edit-title', length);

        if (!length || length > 50) {
            validObj.title = false;
        }
        else {
            validObj.title = true;
        }

        if (length > 50) {
            errTip.text(50 - length);
        }
        else {
            errTip.text('');
        }
    });
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
 * 编辑页面title初始化close按钮和提交验证
 *
 * @param {Object} validObj, 验证信息对象
 *
 */
editCom.initTitleClose = function (validObj) {
    var itemValue = $('#edit-title').val();
    var itemLen = itemValue.length;
    this.toggleX('edit-title', itemLen);
    if (itemLen > 0 && itemLen <= 50) {
        validObj.title = true;
    }
};

/**
 * 编辑页面content初始化close按钮和提交验证
 *
 * @param {Object} validObj, 验证信息对象
 *
 */
editCom.initTitleClose = function (validObj) {
    var $textDom = $('#edit-contnet');
    var itemValue = $textDom.text();
    var itemLen = itemValue.length;
    this.toggleX('edit-content', itemLen);
    if (itemLen <= 50000) {
        validObj.content = true;
    }
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
        // 已经有的附件信息, 没有传空数组, 这个主要是用于修改
        originAttaches: [],
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
    var attach = attach.initAttach(attachOptions, util.transKey(attachData), selector);
    return attach;
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

module.exports = editCom;
