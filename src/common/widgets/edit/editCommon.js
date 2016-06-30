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
    isAttachesReady: true,
};

editCom.aTag = {
    principalIsNull: true,
    attendsIsNull: true,
    attachIsNull:true
};

// 埋点数据
editCom.actions = {
    task: function () {
        var me = editCom;
        var taskId = util.params('taskId');
        var $content = $('#edit-content');
        var action = {};
        var targetTag = {};
        if (taskId) {
            action.actionTag = 'editTaskSubmit';
            action.targetTag = {
                taskId: taskId
            }
        }
        else {
            action.actionTag = 'newTaskSubmit';
            
            if ($content && $.trim($content.text())) {
                targetTag.content = true;
            }
            if (!me.aTag.principalIsNull) {
                targetTag.principal = true;
            }
            if (!me.aTag.attendsIsNull) {
                targetTag.attends = true;
            }
            if (!me.aTag.attachIsNull) {
                targetTag.attachs = true;
            }
            action.targetTag = targetTag;
        }
        return action;
    },
    talk: function () {
        var me = editCom;
        var talkId = util.params('id');
        var $content = $('#edit-content');
        var action = {};
        var targetTag = {};
        if (talkId) {
            action.actionTag = 'editTalkSubmit';
            action.targetTag = {
                talkId: talkId
            }
        }
        else {
            action.actionTag = 'newTalkSubmit';
            if ($content && $.trim($content.text())) {
                targetTag.content = true;
            }
            if (!me.aTag.attachIsNull) {
                targetTag.attachs = true;
            }
            action.targetTag = targetTag;
        }
        return action;
    },
    affair: function () {
        var me = editCom;
        var affairId = util.params('id');
        var $content = $('#edit-content');
        var action = {};
        var targetTag = {};
        if (affairId) {
            action.actionTag = 'editAffairSubmit';
            action.targetTag = {
                affairId: affairId
            }
        }
        else {
            action.actionTag = 'newAffairSubmit';
            if ($content && $.trim($content.text())) {
                targetTag.content = true;
            }
            if (!me.aTag.attachIsNull) {
                targetTag.attachs = true;
            }
            action.targetTag = targetTag;
        }
        return action;
    }
}

/**
 * 验证不通过弹窗
 *
 * @param {Array|string} alertSentence, 需要弹窗提示的提示语
 *
 */
editCom.validAlert = function (alertSentence) {
    var me = this;
    if (window.isAjaxErrorAlert) {
        me.clearAlert();
        return;
    }
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
    var alertSentence = [lang.putFailed, lang.putCompleted];
    var me = this;
    if (window.isAjaxErrorAlert) {
        me.clearAlert();
        return;
    }
    var $alertDom = $('#alert-submit-after');

    this.clearAlert();
    $alertDom.find('i')[0].className = isOk ? 'circle-right' : 'circle-err';
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

    if (flag && submitFn && $.isFunction(submitFn)) {
        submitFn();
    }
    else {
        if (!validObj.title) {
            if (!$.trim($('#edit-title').text())) {
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
    if (!phoneInputTitle || !phoneInputContent || !attach) {
        return;
    }
    var validObj = this.valid;
    validObj.isEdit = phoneInputTitle.isEdited() || phoneInputContent.isEdited() || validObj.isEdit;
    validObj.content = !!phoneInputContent.isAllowSubmit();
    validObj.title = !!(phoneInputTitle.isAllowSubmit() && $.trim($('#edit-title').text()));
    validObj.isAttachesReady = attach ? attach.isAttachesReady() : false;
};

/**
 * 提交和取消按钮
 *
 * @param {Object} phoneInputTitle, title 文本框对象
 * @param {Object} phoneInputContent, content 文本框对象
 * @param {Object} attach, 附件对象
 * @param {Function} submitFn, 验证成功的提交操作
 * @param {Object} pageType, 页面
 * @param {Object} page, 页面对象
 */
editCom.subAndCancel = function (phoneInputTitle, phoneInputContent, attach, submitFn, pageType, page) {
    var me = this;
    var validObj = me.valid;

    function goBack() {
        validObj.isEdit = phoneInputTitle.isEdited() || phoneInputContent.isEdited() || validObj.isEdit;
        me.cancelValidate();
    }

    navigation.left({
        title: lang.cancel,
        click: goBack
    });

    if (phoneInputTitle && phoneInputContent && attach) {
        navigation.right([
            {
                title: lang.submit,
                click: function () {

                    me.setValidObj(phoneInputTitle, phoneInputContent, attach);
                    page.log.store(me.actions[pageType]());
                    me.submitValid(submitFn);
                }
            }
        ]);
    }
    navigation.buttonAutoEnable();
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
    if (!page || !ajaxUrl) {
        dfd.reject();
        return dfd;
    }

    data = data || {};
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
        .always(function (result) {
            me.submitAlert(success);
        });
    return dfd;
};

/**
 * 初始化紧急程度mobiscroll
 *
 * @param {string} selector, 选择器字符串
 * @param {Object} data, 页面数据
 * @return {boolean} 参数错误
 */
editCom.initImportanceLevel = function (selector, data) {
    if (!selector || !data) {
        return false;
    }
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
 * @return {boolean} 参数错误
 */
editCom.initMobiscroll = function (method, selector, data) {
    if (!method || !selector || !data) {
        return false;
    }
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
    data = data || {};
    var attachObj = attachWrapper.initAttach({
        container: '#attachList',
        addBtn: '#addAttach',
        callback: function () {
            if (attachObj.getModifyAttaches().length > 0) {
                me.valid.isEdit = true;
                me.aTag.attachIsNull = false;
            }
            else {
                me.aTag.attachIsNull = true;
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
    return level && raw.importanceMap[level];
};

/**
 * 选择人员是否改变
 *
 * @param {Array|number} oldValue, 修改之前的数据
 * @param {Array|number} newValue, 修改之后的数据
 * @param {string} key, 参与人或负责人
 */
editCom.personIsChange = function (oldValue, newValue, key) {
    var me = this;
    var validObj = me.valid;
    if ($.isArray(oldValue) && $.isArray(newValue)) {
        validObj.isEdit = this.compareArr(oldValue, newValue) ? true : validObj.isEdit;
    }
    else {
        validObj.isEdit = oldValue !== newValue ? true : validObj.isEdit;
    }
    me.personIsNull(newValue, key);
};

/**
 * 选择人员是否为空
 *
 * @param {Array|number} value, 修改之后的数据
 * @param {string} key, 参与人或负责人
 */
editCom.personIsNull = function (value, key) {
    var me = this;
    var isNull = true;
    if ($.isArray(value) && value.length) {
        isNull = false;
    }
    else if ((typeof value === 'string') && value) {
        isNull = false;
    }
    me.aTag.principalIsNull = key === 'principal' ? isNull : me.aTag.principalIsNull;
    me.aTag.attendsIsNull = key === 'attends' ? isNull : me.aTag.attendsIsNull;
}

/**
 * 渲染页面
 *
 * @param {Object} page, 页面对象
 * @param {Object} data, 渲染数据
 */
editCom.loadPage = function (page, data) {
    data = data || {};
    if (page) {
        page.render('#edit-container', data, {
            partials: {editMain: newTemplate, alertBox: alertTpl, attach: attachTpl}
        });
    }
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
        jid = [users.makeJid(id, cid)];
    }
    else {
        id.forEach(function (itemId) {
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
 * @return {boolean} 参数错误
 */
editCom.setChoosePersonLoc = function (key, value) {
    var me = this;
    if (!key || !value) {
        return false;
    }
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
    var newArr = [];
    if (arr && $.isArray(arr)) {
        arr.forEach(function (value) {
            newArr.push(value);
        });
    }
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
    if (!arr1 || !arr2 || !$.isArray(arr1) || !$.isArray(arr2)) {
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
    if (target && (typeof target === 'object') && source && (typeof source === 'object')) {
        for (var key in target) {
            if (target.hasOwnProperty(key) && source.hasOwnProperty(key)) {
                target[key] = source[key];
            }
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
    var nameArr = [];
    if (arr && $.isArray(arr)) {
        arr.forEach(function (item) {
            nameArr.push(item.name);
        });
    }
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
    var newArr = [];
    if (arr && $.isArray(arr)) {
        for (var i = 0, len = arr.length; i < len; i++) {
            if ($.inArray(arr[i], newArr) === -1) {
                newArr.push(arr[i]);
            }
        }
    }
    return newArr;
};

/**
 * 人员渲染
 *
 * @param {Object} obj, 渲染人员的数据
 */
editCom.renderPerson = function (obj) {
    var me = this;
    obj = obj || {};

    // 下面为获取人员信息的配置
    var cid = localStorage.getData(config.const.PARAMS).cid;
    var jids = users.makeArray(obj);
    if (!jids.length) {
        return;
    }

    var dfdPub = users.getUserInfo(jids, cid);

    // 查询用户信息失败
    if (dfdPub === null) {
        me.userInfoFail = true;
    }
    else {
        dfdPub
            .done(function (pubData) {
                me.renderUser(obj, pubData.contacts);
            })
            .fail(function () {
                me.failUser();
            });
    }
}

// 来自于deo, 获取人员信息
/**
 * 查找某子对象是否属于源数据对象，同时把对应的数据附加到 appendObject 上
 *
 * @param {Object} srcObject, 源数据对象
 * @param {Object} itemObject, 子对象
 * @param {Object} appendObject, 匹配到某对象上
 *
 */
editCom.findOwner = function (srcObject, itemObject, appendObject) {

    if (itemObject && itemObject.jid) {

        var id = parseInt(users.takeJid(itemObject.jid), 10);

        for (var key in srcObject) {
            if (srcObject.hasOwnProperty(key)) {

                var objIds = srcObject[key];

                if ($.isArray(objIds) && $.inArray(id, objIds) !== -1) {

                    var appender = appendObject[key];
                    if (!$.isArray(appender)) {
                        appendObject[key] = [];
                    }

                    itemObject && appendObject[key].push(itemObject);
                }
                // 非数组直接判断是否相等
                else if (objIds === id) {
                    appendObject[key] = itemObject;
                }

            }
        }
    }
};

/**
 * 成员获取失败
 *
 */
editCom.failUser = function () {
    var me = this;
    $('#attends .value').html(lang.dataLoadFailPleaseReLoad);
};

/**
 * 渲染成员数据
 *
 * @param {Array} originArr, 原始数组数据 jids，未merge 过的数组
 * @param {Array} dataArr, 匹配到的数据
 *
 */
editCom.renderUser = function (originArr, dataArr) {
    var me = this;
    var data = {
        principal: null,
        partner: null
    };

    dataArr.forEach(function (item) {
        me.findOwner(originArr, item, data);
    });

    var dataRaw = {};

    // 负责人数据
    if (data.principal && data.principal.name) {
        dataRaw.principal = data.principal.name;
    }

    // 成员数据
    if (data.partner) {
        var partnerRaw = [];
        data.partner.forEach(function (item) {
            partnerRaw.push(item.name);
        });
        partnerRaw = me.unique(partnerRaw);
        dataRaw.partnerRaw = partnerRaw.join('、');
    }
    if (dataRaw.principal) {
        $('#principal .value').text(dataRaw.principal);
    }
    if (dataRaw.partnerRaw) {
        $('#attends .value').text(dataRaw.partnerRaw);
    }
};

module.exports = editCom;
