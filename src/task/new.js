/**
 * @file new.js
 * @author hefeng
 * 新建任务页
 *
 */
require('common/widgets/edit/new.scss');
var editCom = require('common/widgets/edit/editCommon');
var config = require('config');
var Page = require('common/page');
var users = require('common/middleware/user/users');
var PhoneInput = require('common/ui/phoneInput/phoneInput');
var util = require('common/util');
var ls = require('common/localstorage');
// var CPNavigationBar = require('dep/ui/campo-navigationbar/campo-navigationbar');

var page = new Page({
    pageName: 'task-new'
});

// new: 默认值
// edit: $.extend(pageData, page.data);
/* eslint-disable */
var pageData = {
    id : 0,
    title: '',
    content: '',
    end_time: 0,
    importance_level: 1,
    attend_ids: [],
    notice: 0,
    principal_user: 0,
    attachements: [],
    message: {
        sent_eim: true,
        sent_emai: false,
        sent_sms: false
    }
};
/* eslint-ensable */

var principalSelectKey = 'taskPrincipalSelector';
var attendSelectKey = 'taskAttandSelectKey';

page.enter = function () {
    var me = this;
    me.loadPage();
    me.initValue();
    me.initPlugin();
    me.bindEvents();
};

/**
 * 绑定事件
 *
 */
page.bindEvents = function () {
    var me = this;
    var valid = me.valid;
    editCom.bindGetFocus();

    editCom.subAndCancel(me.phoneInputTitle, me.phoneInputContent, me.attach, function () {
        pageData.attachements = me.attach.getModifyAttaches();
        var url = pageData.id === 0 ? config.API.TASK_NEW_URL : config.API.TASK_EDIT_URL;

        var promise = editCom.submit(page, pageData, url);
        promise.done(function (result) {
            var taskId = result.data || pageData.id;
            /* eslint-disable */
            CPNavigationBar.redirect('/task/detail.html?task_id=' + taskId);
            /* eslint-enable */
        });
    });
    /* eslint-disable */
    // 完成时间跳转页面
    $('#doneTime').on('click', function () {
        var oldVal = pageData['end_time'];
        CPNavigationBar.redirect('/task/doneTime.html?endTime=' + pageData['end_time'], '完成时间', false, function (data) {
            if (!data) {
                return;
            }
            data = JSON.parse(data);
            pageData['end_time'] = data.endTime;
            $('#doneTime .value').text(editCom.initDoneTime(pageData['end_time']));
            valid.isEdit = oldVal !== pageData['end_time'] ? true : valid.isEdit;
        });
    });

    // 选择人员跳转页面
    $('#principal, #attends').on('click', function (e) {
        var key = '';
        var itemKey = '';
        var id = '';
        var oldVal = null;
        if (e.target.id === 'principal') {
            key = principalSelectKey;
            itemKey = 'principal_user';
            id = '#principal';
        }
        else {
            key = attendSelectKey;
            itemKey = 'attend_ids';
            id = '#attends';
        } 
        oldVal = pageData[itemKey];
        CPNavigationBar.redirect('/selector/selector.html?paramId=' + key, '选人', false, function (data) {
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
            editCom.personIsChange(oldVal, pageData[itemKey], valid);
        });
    });
    /* eslint-enable */
};

/**
 * 加载页面
 *
 */
page.loadPage = function () {
    var me = this;
    var data = $.extend({}, pageData, {
        view: [
            {
                persons: [
                    {
                        id: 'principal',
                        title: '负责人'
                    },
                    {
                        id: 'attends',
                        title: '参与人'
                    }
                ]
            },
            {
                options: [
                    {
                        id: 'doneTime',
                        title: '完成时间',
                        /* eslint-disable */
                        value: editCom.initDoneTime(pageData['end_time'])
                        /* eslint-enable */
                    },
                    {
                        id: 'urgencyBlock',
                        title: '紧要程度',
                        /* eslint-disable */
                        value: editCom.initImportValue(pageData['importance_level'])
                        /* eslint-enable */
                    }
                ]
            }
        ],
        placeholderTitle: '请输入任务标题(必填)',
        placeholderContent: '请输入任务描述(选填)'
    });

    editCom.loadPage(me, data);
};

page.initPlugin = function () {
    var me = this;
    // 初始化紧急程度
    editCom.initImportanceLevel('#urgencyBlock', pageData);

    // 初始化附件组件
    me.attach = editCom.initEditAttach(pageData.attachements);

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

page.initValue = function () {
    var me = this;
    // TODO 修改存储数据
    var pVal = {
        selectType: 1,
        filter: {
            disabled: {
                contacts: []
            },
            // 已选择的数据
            checked: {
                // 数组
                /* eslint-disable */
                contacts: editCom.transJid(pageData['principal_user'])
                /* eslint-enable */
            }
        }
    };

    var aVal = {
        selectType: 2,
        filter: {
            disabled: {
                contacts: []
            },
            // 已选择的数据
            checked: {
                // 数组
                /* eslint-disable */
                contacts: editCom.transJid(pageData['attend_ids'])
                /* eslint-enable */
            }
        }
    };

    editCom.setChoosePersonLoc(principalSelectKey, pVal);
    editCom.setChoosePersonLoc(attendSelectKey, aVal);
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
    $('#attends .value').html('数据加载失败, 刷新重试');
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
var doing = +util.params('task_id');

if (doing) {
    page.addParallelTask(function (dfd) {
        var me = this;
        var url = config.API.TASK_DETAIL_URL;
        var promise = me.get(url, {
            task_id: +util.params('task_id')
        });

        promise
            .done(function (result) {
                if (result.meta.code !== 200) {
                    dfd.reject(result);
                }
                else {
                    // $.extend(pageData, result.data);

                    util.getDataFromObj(pageData, result.data);

                    // 下面为获取人员信息的配置
                    var obj = {
                        principal: pageData['principal_user'],
                        partner: pageData['attend_ids']
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

                    dfd.resolve();
                }
            });
        return dfd;
    });
}

$(function () {
    page.start();
});
