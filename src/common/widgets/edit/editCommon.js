/**
 * @file editCommon.js
 * @author hefeng
 * 新建、编辑任务、事件、讨论的公共API
 *
 */
var util = require('common/util');
var attachMid = require('common/attachMid');
var phoneMid = require('common/phoneMid');
var localStorage = require('common/localstorage');

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
 * 验证不通过弹窗
 *
 * @param {Array|string} alertSentence, 需要弹窗提示的提示语
 *
 */
editCom.validAlert = function (alertSentence) {
    var me = this;
    var $alertDom = $('#alert-length-limit');
    if (typeof alertSentence === 'string') {
        var str = alertSentence;
        alertSentence = [];
        alertSentence.push(str);
    }
    var len = alertSentence.length;
    var time = 0;
    if (len > 1) {
        $alertDom.text(alertSentence[0]).removeClass('hide');
        time = 3000;
    }
    else if (len === 1) {
        $alertDom.text(alertSentence[0]).removeClass('hide');
        time = 3000;
    }
    else {
        return;
    }
    setTimeout(function () {
        $alertDom.addClass('hide');
        alertSentence.shift();
        if (alertSentence.length) {
            me.validAlert(alertSentence);
        }
    },
    time);
};

/**
 * 提交提示信息弹窗
 *
 * @param {boolean} isOk, 是否提交成功
 *
 */
editCom.submitAlert = function (isOk) {
    var alertSentence = ['提交任务失败', '提交任务完成'];
    var me = this;
    var $alertDom = $('#alert-submit-after');

    $alertDom.find('i').className = isOk ? 'circle-right' : 'circle-err';
    $alertDom.find('.alert-words').text(alertSentence[+isOk]);
    $alertDom.removeClass('hide');
    setTimeout(function () {
        $alertDom.addClass('hide');
    },
    3000);
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
            if(!$('#edit-title').text()) {
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
    validObj.isEdit = title.isEdited() || content.isEdited() || validObj.isEdit;
    validObj.content = !!content.isAllowSubmit();
    validObj.title = !!(title.isAllowSubmit() && $('#edit-title').text());
    validObj.isAttachesReady = attach.isAttachesReady();
};

/**
 * 虚拟手机端提交和取消按钮
 *
 * @param {Object} phoneInputTitle, 标题的phoneInput对象
 * @param {Object} phoneInputContent, 描述的phoneInput对象
 * @param {Object} attach, 附件对象
 * @param {Object} validObj, 验证信息
 * @param {Function} submitFn, 验证成功的提交操作
 */
editCom.subAndCancel = function (phoneInputTitle, phoneInputContent, attach, validObj, submitFn) {
    var me = this;
    $('#submit').on('click', function () {
        me.setValidObj(phoneInputTitle, phoneInputContent, attach, validObj);
        console.log(validObj);
        me.submitValid(submitFn, validObj);
    });

    $('#cancel').on('click', function () {
        validObj.isEdit = phoneInputTitle.isEdited() || phoneInputContent.isEdited() || validObj.isEdit;
        me.cancelValidate(validObj);
    });
};

/**
 * 提交操作
 *
 * @param {Object} page, 页面对象
 * @param {Object} data, 提交的数据
 * @param {Object} attach, 附件对象
 * @param {string} postUrl, 上传url
 */
editCom.submit = function (page, data, attach, postUrl) {
    var me = this;
    var dfd = new $.Deferred();
    data.attachements = attach.getModifyAttaches();
    data.title = $('#edit-title').text();
    data.content = $('#edit-content').text();
    /* eslint-disable */
    var promise = page.post(postUrl, data);
    console.log(data);
    promise
        .done(function (result) {
            if (result.meta.code !== 200) {
                dfd.reject(result);
            } 
            else {
                editCom.submitAlert(true);
                // TODO
                dfd.resolve();
            }
        }).fail(function (result) {
            // TODO
            editCom.submitAlert(false);
        });
    /* eslint-enable */
}

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
            var oldVal = +infoData['importance_level'];
            infoData['importance_level'] = +inst.getVal();
            $(selector + ' .value').text(text);

            validObj.isEdit = oldVal !== infoData['importance_level'] ? true : validObj.isEdit;
            /* eslint-enable */
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
};

/**
 * 初始化完成紧急程度填充字符串
 *
 * @param {number} level, 重要程度数字表示
 * @return {string} 重要程度字符串表示
 */
editCom.initImportValue = function (level) {
    var importanceLevel = ['普通', '重要', '紧急', '重要且紧急'];
    return importanceLevel[level - 1];
};

/**
 * 初始化事件页面的时间类型
 *
 * @param {number} labelId 事件类型id
 * @return {string} 根据事件类型转换的事件类型字符串
 */
editCom.initAffairType = function (labelId) {
    var types = ['待办', '求助', '汇报', '计划', '日志', '记录', '消息', '其他'];
    return types[labelId];
}
/**
 * 选择人员是否改变
 *
 * @param {Array|number} oldValue, 修改之前的数据
 * @param {Array|number} newValue, 修改之后的数据
 * @param {Object} validObj, 提交验证信息
 */
editCom.personIsChange = function (oldValue, newValue, validObj) {
    if ($.isArray(oldValue) && $.isArray(newValue)) {
        validObj.isEdit = util.compareArr(oldValue, newValue) ? true : validObj.isEdit;
    }
    else {
        validObj.isEdit = oldValue !== newValue ? true : validObj.isEdit;
    }
};

/**
 * 渲染页面
 *
 * @param {Object} page, 页面对象
 * @param {Object} data, 渲染数据
 */
editCom.loadPage = function (page, data) {
    var template = require('common/widgets/edit/new');
    var alertTpl = require('common/widgets/edit/alert');

    page.render('#edit-container', data, {
        partials: {editMain: template, alertBox: alertTpl}
    });
};

/**
 * 转换参与人和负责人的id为jid
 *
 * @param {Array|number} id, 人员id
 * @return {Array|string}, jid
 */
editCom.transJid = function (id) {
    var cid = localStorage.getData('cid');
    var jid = [];
    if (!$.isArray(id)) {
        return phoneMid.makeJid(id, cid);
    }
    else {
        id.forEach(function (itemId) {
            jid.push(phoneMid.makeJid(itemId, cid));
        });

        return jid;
    }
};

editCom.getClientMsg = function () {
    var data = localStorage.getData('TASK_PARAMS');
    return {
        uid: data.uid,
        cid: data.cid,
        client: data.client,
        lang: data.lang,
        puse: data.puse,
        appver: data.appver || '111.1.1'
    };
};
module.exports = editCom;
