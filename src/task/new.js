/**
 * @file new.js
 * @author hefeng
 * 新建任务页
 *
 */
require('common/widgets/edit/new.scss');
require('dep/ui/mobiscroll/css/mobiscroll-2.17.0.css');
require('dep/ui/mobiscroll/js/mobiscroll-2.17.0.js');
var editCom = require('common/widgets/edit/editCommon');
var config = require('config');
var Page = require('common/page');
var users = require('common/middleware/user/users');
var PhoneInput = require('common/ui/phoneInput/phoneInput');
var util = require('common/util');
var ls = require('common/localstorage');

// 判断是否是编辑页面
var doing = +util.params('taskId');

var page = new Page();

// new: 默认值
// edit: $.extend(pageData, page.data);
/* eslint-disable */
var pageData = {
    id : 0,
    title: '',
    content: '',
    endTime: 0,
    importanceLevel: 1,
    attendIds: [],
    notice: 0,
    principalUser: 0,
    attachements: [],
    message: {
        sentEim: true,
        sentEmai: false,
        sentSms: false
    }
};
/* eslint-ensable */

var principalSelectKey = 'taskPrincipalSelector';
var attendSelectKey = 'taskAttandSelectKey';

page.enter = function () {
    var me = this;
    me.loadPage();
    me.initPlugin();
    me.bindEvents();
};

page.deviceready = function () {
    var me = this;
    var lang = me.lang;

    if (doing) {
        // 渲染人员信息
        

        // 下面为获取人员信息的配置
        var obj = {
            principal: pageData['principalUser'],
            partner: pageData['attendIds']
        };
        var cid = ls.getData('TASK_PARAMS')['cid'];
        var jids = users.makeArray(obj);
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

    // 初始化附件组件
    me.attach = editCom.initEditAttach(pageData.attachements);
    

    // bindevents
    editCom.subAndCancel(me.phoneInputTitle, me.phoneInputContent, me.attach, function () {
        pageData.attachements = me.attach.getModifyAttaches();
        var url = pageData.id === 0 ? config.API.TASK_NEW_URL : config.API.TASK_EDIT_URL;

        var promise = editCom.submit(page, pageData, url);
        promise.done(function (result) {
            var taskId = result.data || pageData.id;
            /* eslint-disable */
            CPNavigationBar.redirect('/task-detail.html?taskId=' + taskId);
            /* eslint-enable */
        });
    });

    /* eslint-disable */
    // 完成时间跳转页面
    $('#doneTime').on('click', function () {
        var oldVal = pageData['endTime'];
        CPNavigationBar.redirect('/task-doneTime.html?endTime=' + pageData['endTime'], lang.doneTime, false, function (data) {
            if (!data) {
                return;
            }
            data = JSON.parse(data);
            pageData['endTime'] = data.endTime;
            $('#doneTime .value').text(editCom.initDoneTime(pageData['endTime']));
            editCom.valid.isEdit = oldVal !== pageData['endTime'] ? true : editCom.valid.isEdit;
        });
    });

    // 选择人员跳转页面
    $('#principal, #attends').on('click', function (e) {
        var pVal = {
            selectType: 1,
            /* eslint-disable */
            contacts: editCom.transJid(pageData['principalUser'])
            /* eslint-enable */
        };

        var aVal = {
            selectType: 2,
            /* eslint-disable */
            contacts: editCom.transJid(pageData['attendIds'])
            /* eslint-enable */
        };

        editCom.setChoosePersonLoc(principalSelectKey, pVal);
        editCom.setChoosePersonLoc(attendSelectKey, aVal);

        var key = '';
        var itemKey = '';
        var id = '';
        var oldVal = null;
        if (e.target.id === 'principal') {
            key = principalSelectKey;
            itemKey = 'principalUser';
            id = '#principal';
        }
        else {
            key = attendSelectKey;
            itemKey = 'attendIds';
            id = '#attends';
        } 
        oldVal = pageData[itemKey];
        CPNavigationBar.redirect('/selector-selector.html?paramId=' + key, lang.choosePerson, false, function (data) {
            if (!data) {
                return;
            }
            data = JSON.parse(data);
            var contacts = data.contacts;
            if ($.isArray(pageData[itemKey])) {
                contacts.forEach(function (value, index) {
                    pageData[itemKey].push(+users.takeJid(value.jid));
                });
            }
            else {
                pageData[itemKey] = +users.takeJid(contacts[0].jid);
            }
            $(id + ' .value').text(util.getPersonsName(contacts));
            editCom.personIsChange(oldVal, pageData[itemKey]);
        });
    });
    /* eslint-enable */
};

/**
 * 绑定事件
 *
 */
page.bindEvents = function () {
    var me = this;
    editCom.bindGetFocus();
};

/**
 * 加载页面
 *
 */
page.loadPage = function () {
    var me = this;
    var lang = me.lang;
    var data = $.extend({}, pageData, {
        view: [
            {
                persons: [
                    {
                        id: 'principal',
                        title: lang.principal
                    },
                    {
                        id: 'attends',
                        title: lang.attends
                    }
                ]
            },
            {
                options: [
                    {
                        id: 'doneTime',
                        title: lang.doneTime,
                        /* eslint-disable */
                        value: editCom.initDoneTime(pageData['endTime'])
                        /* eslint-enable */
                    },
                    {
                        id: 'urgencyBlock',
                        title: lang.urgentLevel,
                        /* eslint-disable */
                        value: editCom.initImportValue(pageData['importanceLevel'])
                        /* eslint-enable */
                    }
                ]
            }
        ],
        placeholderTitle: lang.newTaskPlaceholderTitle,
        placeholderContent: lang.newTaskPlaceholderContent
    });

    editCom.loadPage(me, data);
};

page.initPlugin = function () {
    var me = this;
    // 初始化紧急程度
    editCom.initImportanceLevel('#urgencyBlock', pageData);

    // 初始化富文本框
    me.phoneInputTitle = new PhoneInput({
        'handler': '.title-wrap',
        'input': '#edit-title',
        'limit': 50,
        'delete': true
    });

    me.phoneInputContent = new PhoneInput({
        'handler': '.content-wrap',
        'input': '#edit-content',
        'limit': 5000,
        'delete': true
    });
};

// 来自于deo, 获取人员信息
/**
 * 查找某子对象是否属于源数据对象，同时把对应的数据附加到 appendObject 上
 *
 * @param {Object} srcObject, 源数据对象
 * @param {Object} itemObject, 子对象
 * @param {Object} appendObject, 匹配到某对象上
 *
 */
page.findOwner = function (srcObject, itemObject, appendObject) {

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

                    appendObject[key].push(itemObject);
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
page.failUser = function () {
    var me = this;
    $('#attends .value').html(me.lang.dataLoadFailPleaseReLoad);
};

/**
 * 渲染成员数据
 *
 * @param {Array} originArr, 原始数组数据 jids，未merge 过的数组
 * @param {Array} dataArr, 匹配到的数据
 *
 */
page.renderUser = function (originArr, dataArr) {
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
    if (data.principal) {
        dataRaw.principal = data.principal.name;
    }

    // 成员数据
    if (data.partner) {
        var partnerRaw = [];
        data.partner.forEach(function (item) {
            partnerRaw.push(item.name);
        });

        dataRaw.partnerRaw = partnerRaw.join('、');
    }
    $('#principal .value').text(dataRaw.principal);
    $('#attends .value').text(dataRaw.partnerRaw);
};

/**
 * 请求页面接口
 *
 * @param {deferred} dfd, deferred
 *
 */
/* eslint-disable */


page.addParallelTask(function (dfd) {
    var me = this;
    if (!doing) {
        dfd.resolve();
        return dfd;
    }
    var url = config.API.TASK_EDIT_URL;
    var promise = me.get(url, {
        taskId: +util.params('taskId')
    });

    promise
        .done(function (result) {
            if (result.meta.code !== 200) {
                dfd.reject(result);
            }
            else {
                util.getDataFromObj(pageData, result.data);
                dfd.resolve();
            }
        });
    return dfd;
});


$(function () {
    page.start();
});
