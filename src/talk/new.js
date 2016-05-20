/**
 * @file new.js
 * @author hefeng
 * 新建讨论页, 编辑讨论页面
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
// var CPNavigationBar = require('dep/campo-navigationbar/campo-navigationbar');
var doing = +util.params('talk_id');
var page = new Page({
    pageName: 'talk-new'
});
/* eslint-disable */
var pageData = {
    id: 0,
    attachs: [],
    content: '',
    importance_level: 1,
    inheritance: true,
    message: {
        sent_eim: true,
        sent_emai: false,
        sent_sms: false
    },
    task_id: +util.params('task_id') || 0,
    title: '',
    user_ids: []
};
/* eslint-enable */
var selectKey = 'talkAttandSelectKey';

page.enter = function () {
    var me = this;
    me.loadPage();
    me.initValue();
    me.initPlugin();
    me.bindEvents();
};

page.allready = function () {
    var me = this;

    if (doing) {
        util.getDataFromObj(pageData, me.data);
        // 下面为获取人员信息的配置
        var obj = {
            /* eslint-disable */
            partner: pageData['user_ids']
            /* eslint-enable */
        };
        var cid = ls.getData('TASK_PARAMS').cid;
        var jids = users.makeArray(obj);
        var dfdPub = users.getUserInfo(jids, cid);

        // 查询用户信息失败
        if (dfdPub === null) {
            me.userInfoFail = true;
        }
        else {
            dfdPub
                .done(function (pubData) {
                    me.renderUser(pubData.contacts);
                })
                .fail(function () {
                    me.failUser();
                });
        }
    }

    // 初始化附件组件
    me.attach = editCom.initEditAttach(pageData.attachs);

    // bindEvents
    editCom.subAndCancel(me.phoneInputTitle, me.phoneInputContent, me.attach, function () {
        pageData.attachs = me.attach.getModifyAttaches();
        var url = pageData.id === 0 ? config.API.TALK_NEW_URL : config.API.TALK_EDIT_URL;
        // editCom.submit(me, url);
        var promise = editCom.submit(page, pageData, url);
        promise.done(function (result) {
            var taskId = pageData.task_id;
            var talkId = result.data || pageData.id;
            /* eslint-disable */
            CPNavigationBar.redirect('/talk-detail.html?id=' + talkId + '&task_id=' + taskId);
            /* eslint-enable */
        });
    });

    /* eslint-disable */
    // 选择人员跳转页面
    $('#attends').click(function () {
        var oldVal = pageData['user_ids'];
        CPNavigationBar.redirect('/selector-selector.html?paramId=' + selectKey, '选人', false, function (data) {
            if (!data) {
                return;
            }
            data = JSON.parse(data);
            var contacts = data.contacts;
            contacts.forEach(function (value, index) {
                pageData['user_ids'].push(+users.takeJid(value.jid));
            });
            $('#attends .value').text(util.getPersonsName(contacts));
            editCom.personIsChange(oldVal, pageData['user_ids'], valid);
        });
    });
    /* eslint-enable */
};

/**
 * 绑定事件
 *
 */
page.bindEvents = function () {
    editCom.bindGetFocus();
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
                id: 'urgencyBlock',
                title: '紧要程度',
                /* eslint-disable */
                value: editCom.initImportValue(pageData['importance_level'])
                /* eslint-enable */
            },
            {
                id: 'attends',
                title: '参与人'
            }
        ],
        placeholderTitle: '请输入讨论标题(必填)',
        placeholderContent: '请输入讨论描述(选填)'
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

page.initValue = function () {
    // TODO 修改存储数据
    var val = {
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

    editCom.setChoosePersonLoc(selectKey, val);
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
 * @param {Array} dataArr, 匹配到的数据
 *
 */
page.renderUser = function (dataArr) {

    var dataRaw = {};

    // 成员数据
    if (dataArr.length) {
        var partnerRaw = [];
        dataArr.forEach(function (item) {
            partnerRaw.push(item.name);
        });

        dataRaw.partnerRaw = partnerRaw.join('、');
    }

    $('#attends .value').text(dataRaw.partnerRaw);
};

/**
 * 请求页面接口
 *
 * @param {deferred} dfd, deferred
 *
 */
/* eslint-disable */



if (doing) {
    page.addParallelTask(function (dfd) {
        var me = this;
        var url = config.API.TALK_DETAIL_URL;
        var promise = me.get(url, {
            talk_id: +util.params('talk_id')
        });

        promise
            .done(function (result) {
                if (result.meta.code !== 200) {
                    dfd.reject(result);
                }
                else {
                    // $.extend(pageData, result.data);
                    dfd.resolve();
                }
            });
        return dfd;
    });
}
/* eslint-enable */
$(function () {
    page.start();
});
