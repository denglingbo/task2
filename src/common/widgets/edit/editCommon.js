/**
 * @file editCommon.js
 * @author hefeng
 * 新建、编辑任务、事件、讨论的公共API
 *
 */
var util = require('common/util');
var attachWrapper = require('common/middleware/attach/attachWrapper');
var users = require('common/middleware/users/users');
var localStorage = require('common/localstorage');
var lang = require('common/lang').getData();
var navigation = require('common/middleware/navigation');
var MidUI = require('common/middleware/ui');
var raw = require('common/widgets/raw');
var config = require('config');

var newTemplate = require('common/widgets/edit/new');
var alertTpl = require('common/widgets/edit/alert');
var attachTpl = require('common/middleware/attach/attach.tpl');

var editCom = {};
editCom.valid = {
    isEdit: false,
    title: false,
    content: true,
    isAttachesReady: true
};

/**
 * bind 文本框获得焦点事件
 *
 */
editCom.bindGetFocus = function () {
    // $('.edit-title-wrap').on('click', function () {
    //     $('#edit-title').focus();
    // });

    // $('.edit-words').on('click', function () {
    //     $('#edit-content').focus();
    // });
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
    me.clearAlert();
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
    me.timer = setTimeout(function () {
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
    var alertSentence = [lang.putTaskFailed, lang.putTaskCompleted];
    var me = this;
    var $alertDom = $('#alert-submit-after');

    this.clearAlert();
    $alertDom.find('i').className = isOk ? 'circle-right' : 'circle-err';
    $alertDom.find('.alert-words').text(alertSentence[+isOk]);
    $alertDom.removeClass('hide');
    me.timer = setTimeout(function () {
        $alertDom.addClass('hide');
    },
    3000);
};

/**
 * 清除弹窗
 *
 */
editCom.clearAlert = function () {
    clearTimeout(this.timer);
    $('#alert-box .alert').addClass('hide');
};

/**
 * 取消确认是否编辑过, 是否离开弹窗
 *
 */
editCom.cancelValidate = function () {

    if (this.valid.isEdit) {
        MidUI.alert({
            content: lang.whetherGiveUpCurrContent,
            onApply: function () {

                // 编辑过，返回并刷新
                navigation.open(-1, {
                    goBackParams: 'refresh'
                });
            }
        });
    }
    else {
        navigation.open(-1);
    }
};

/**
 * 提交前验证
 *
 * @param {Function} submitFn, 提交到后端的函数
 */
editCom.submitValid = function (submitFn) {
    var validObj = this.valid;
    var flag = validObj.title && validObj.content && validObj.isAttachesReady;
    var arr = [];

    if (flag) {
        submitFn();
    }
    else {
        if (!validObj.title) {
            if (!$('#edit-title').text()) {
                arr.push(lang.titleCannotNull);
            }
            else {
                arr.push(lang.titleCannotMore50);
            }
        }

        if (!validObj.content) {
            arr.push(lang.contentCannotMore5000);
        }

        if (!validObj.isAttachesReady) {
            arr.push(lang.attachNoReady);
        }
    }
    this.validAlert(arr);
};

/**
 * 验证是否能提交，进行最后的验证
 *
 * @param {Object} phoneInputTitle, title 文本框对象
 * @param {Object} phoneInputContent, content 文本框对象
 * @param {Object} attach, 附件对象
 */
editCom.setValidObj = function (phoneInputTitle, phoneInputContent, attach) {
    var validObj = this.valid;
    validObj.isEdit = phoneInputTitle.isEdited() || phoneInputContent.isEdited() || validObj.isEdit;
    validObj.content = !!phoneInputContent.isAllowSubmit();
    validObj.title = !!(phoneInputTitle.isAllowSubmit() && $('#edit-title').text());
    validObj.isAttachesReady = attach.isAttachesReady();
};

/**
 * 虚拟手机端提交和取消按钮
 *
 * @param {Object} phoneInputTitle, title 文本框对象
 * @param {Object} phoneInputContent, content 文本框对象
 * @param {Object} attach, 附件对象
 * @param {Function} submitFn, 验证成功的提交操作
 */
editCom.subAndCancel = function (phoneInputTitle, phoneInputContent, attach, submitFn) {
    var me = this;
    var validObj = me.valid;
    if (!phoneInputTitle || !phoneInputContent || !attach) {
        return;
    }

    function goBack() {
        validObj.isEdit = phoneInputTitle.isEdited() || phoneInputContent.isEdited() || validObj.isEdit;
        me.cancelValidate();
    }

    navigation.left({
        title: lang.cancel,
        click: goBack
    });

    navigation.right([
        {
            title: lang.submit,
            click: function () {
                me.setValidObj(phoneInputTitle, phoneInputContent, attach||page.attach);
                me.submitValid(submitFn);
            }
        }
    ]);
    navigation.buttonAutoEnable();
    // CPNavigationBar.setGoBackHandler(goBack,true);
};

/**
 * 提交操作
 *
 * @param {Object} page, 页面对象
 * @param {string} data, 上传数据
 * @param {string} ajaxUrl, 上传url
 * @return {Object} deferr
 */
editCom.submit = function (page, data, ajaxUrl) {
    var me = this;
    var dfd = new $.Deferred();
    // var data = page.data;

    data.title = $('#edit-title').text();
    data.content = $('#edit-content').html();

    var promise = page.post(ajaxUrl, data);
    var success = false;
    promise
        .done(function (result) {
            if (result.meta.code !== 200) {
                dfd.reject(result);
            }
            else {
                success = true;
                dfd.resolve(result);
            }
        })
        .fail(function (result) {
            dfd.reject(result);
        })
        .always(function () {
            me.submitAlert(success);
        });
    return dfd;
};

/**
 * 初始化紧急程度mobiscroll
 *
 * @param {string} selector, 选择器字符串
 * @param {Object} data, 页面数据
 */
editCom.initImportanceLevel = function (selector, data) {
    var infoData = data;
    var validObj = this.valid;
    var importData = [
        {
            text: raw.importanceMap[1],
            value: 1
        },
        {
            text: raw.importanceMap[2],
            value: 2
        },
        {
            text: raw.importanceMap[3],
            value: 3
        },
        {
            text: raw.importanceMap[4],
            value: 4
        }
    ];

    importData.forEach(function (item) {
        (item.value === infoData.importanceLevel) && (item.selected = true);
    });

    var optionData = {
        headerText: lang.urgentLevel,
        showInput: false,
        showMe: true,
        rows: 3,
        data: importData,
        onSelect: function (text, inst) {
            var oldVal = +infoData.importanceLevel;
            infoData.importanceLevel = +inst.getVal();
            $(selector + ' .value').text(text);

            validObj.isEdit = oldVal !== infoData.importanceLevel ? true : validObj.isEdit;
        }
    };

    this.initMobiscroll('select', selector, optionData);
};

/**
 * 初始化mobiscroll
 *
 * @param {string} method, 初始化mobiscroll的种类
 * @param {string} selector, 选择器字符串
 * @param {Object} data, 初始化参数
 */
editCom.initMobiscroll = function (method, selector, data) {
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

    $(selector).mobiscroll()[method]($.extend({}, mobiOptions, data));
};

/**
 * 初始化新建、编辑页面附件
 *
 * @param {Object} data, 附件数据
 * @return {Object} 附件对象
 */
editCom.initEditAttach = function (data) {
    var me = this;
    var attachObj = attachWrapper.initAttach({
        container: '#attachList',
        addBtn: '#addAttach',
        callback: function () {
            if (attachObj.getModifyAttaches().length > 0) {
                me.valid.isEdit = true;
            }
        }
    }, data);
    return attachObj;
};

/**
 * 初始化完成时间填充字符串
 *
 * @param {time} time, 毫秒时间
 * @return {string} 返回初始化的时间字符串
 */
editCom.initDoneTime = function (time) {
    return time ? util.formatTime(time) : lang.earlyComplete;
};

/**
 * 初始化完成紧急程度填充字符串
 *
 * @param {number} level, 重要程度数字表示
 * @return {string} 重要程度字符串表示
 */
editCom.initImportValue = function (level) {
    return raw.importanceMap[level];
};

/**
 * 选择人员是否改变
 *
 * @param {Array|number} oldValue, 修改之前的数据
 * @param {Array|number} newValue, 修改之后的数据
 */
editCom.personIsChange = function (oldValue, newValue) {
    var validObj = this.valid;
    if ($.isArray(oldValue) && $.isArray(newValue)) {
        validObj.isEdit = this.compareArr(oldValue, newValue) ? true : validObj.isEdit;
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
    page.render('#edit-container', data, {
        partials: {editMain: newTemplate, alertBox: alertTpl, attach: attachTpl}
    });
};

/**
 * 转换参与人和负责人的id为jid
 *
 * @param {Array|number} id, 人员id
 * @return {Array}, jid
 */
editCom.transJid = function (id) {
    var cid = localStorage.getData(config.const.PARAMS).cid;
    var jid = [];

    if (!id) {
        return [];
    }

    if (!$.isArray(id)) {
        // return [{jid: users.makeJid(id, cid)}];
        jid = [users.makeJid(id, cid)];
    }
    else {
        id.forEach(function (itemId) {
            // jid.push({jid: users.makeJid(itemId, cid)});
            jid.push(users.makeJid(itemId, cid));
        });
    }
    return jid;
};

/**
 * 获取客户端信息
 *
 * @return {Object} 客户端信息
 */
editCom.getClientMsg = function () {
    var data = localStorage.getData(config.const.PARAMS);
    return {
        uid: data.uid,
        cid: data.cid,
        client: data.client,
        lang: data.lang,
        puse: data.puse,
        appver: data.appver
    };
};

/**
 * 存储选人组件所需的数据到本地
 *
 * @param {string} key, 存储的key
 * @param {Object} value, 存储的数据
 */
editCom.setChoosePersonLoc = function (key, value) {
    var me = this;
    var selectValue = {
        clientMsg: me.getClientMsg(),
        selector: {
            // 选择人
            contact: 3,
            // 选择部门
            dept: 0,
            // 选择职务
            title: 0
        },
        // 选择组件类型：1.单选 2.复选
        selectType: value.selectType,
        // 指定的过滤数据
        filter: {
            // 指定不显示的数据
            disabled: {
                contacts: [],
                depts: [],
                titles: []
            },
            // 指定显示的数据
            enabled: {
                depts: [],
                titles: []
            },
            // 已选择的数据
            checked: {
                // 数组
                contacts: value.contacts,
                depts: [],
                titles: []
            }
        },
        // 数据源：1.通过原生插件获取 2.从移动网关服务器获取
        dataSource: 1,
        // 从移动网关获取数据的请求信息
        requestInfo: {
            // 请求方式
            type: 'get',
            // 请求发送的数据
            data: '',
            // 请求的url
            url: '',
            headers: {}
        }
    };

    localStorage.addData(key, JSON.stringify(selectValue));
};

/**
 * 数组浅层次clone
 *
 * @param {Array} arr, 需要clone的数组
 * @return {Array} clone的数组
 */
editCom.arrClone = function (arr) {
    if (!$.isArray(arr1)) {
        return [];
    }
    var newArr = [];
    arr.forEach(function (value) {
        newArr.push(value);
    });
    return newArr;
};

/**
 * 比较两个数组的值是否相等
 *
 * @param {Array} arr1, 数组1
 * @param {Array} arr2, 数组2
 * @return {boolean} 是否相等
 */
editCom.compareArr = function (arr1, arr2) {
    if (!$.isArray(arr1) || !$.isArray(arr2)) {
        return false;
    }
    var newArr1 = this.arrClone(arr1).sort();
    var newArr2 = this.arrClone(arr2).sort();
    var isDiff = newArr1.some(function (value, index) {
        return value !== newArr2[index];
    });
    return isDiff;
};

/**
 * 从另一个对象获取与当前对象的属性相同的值
 *
 * @param {Object} target, 被赋值的对象
 * @param {Object} source, 源对象
 *
 */
editCom.getDataFromObj = function (target, source) {
    if (!(typeof target === 'object') || !(typeof source === 'object')) {
        return false;
    }
    for (var key in target) {
        if (target.hasOwnProperty(key) && source.hasOwnProperty(key)) {
            target[key] = source[key];
        }
    }
};

/**
 * 从选人组件返回数据获取人员名
 *
 * @param {Array} arr, 选人组件返回的contacts
 * @return {string}, 人员字符串
 *
 */
editCom.getPersonsName = function (arr) {
    if (!$.isArray(arr)) {
        return [];
    }
    var nameArr = [];
    arr.forEach(function (item) {
        nameArr.push(item.name);
    });
    return nameArr.join('、');
};

/**
 * 数组去重
 *
 * @param {Array} arr, 需去重的数组
 * @return {Array}, 去重后的数组
 *
 */
editCom.unique = function (arr) {
    if (!$.isArray(arr)) {
        return [];
    }
    var newArr = [];
    for (var i = 0, len = arr.length; i < len; i++) {
        if (newArr.indexOf(arr[i]) === -1) {
            newArr.push(arr[i]);
        }
    }
    return newArr;
};
module.exports = editCom;
