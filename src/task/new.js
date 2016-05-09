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
// var CPNavigationBar = require('dep/plugins/campo-navigationbar/campo-navigationbar');

var page = new Page();

// 验证信息
page.valid = {
    isEdit: false,
    title: false,
    content: true,
    isAttachesReady: true
};

var principalSelectKey = 'taskPrincipalSelector';
var attendSelectKey = 'taskAttandSelectKey';

page.enter = function () {
    var me = this;
    me.loadPage();
    me.bindEvents();
    me.initValue();
    me.initPlugin();
};

/**
 * 绑定事件
 *
 */
page.bindEvents = function () {
    var me = this;
    var valid = me.valid;
    editCom.bindGetFocus();

    editCom.subAndCancel(me, function () {
        editCom.submit(me, config.API.TASK_NEW_URL);
    });
    /* eslint-disable */
    // 完成时间跳转页面
    $('#doneTime').on('click', function () {
        var oldVal = me.data['end_time'];
        CPNavigationBar.redirect('/task/doneTime.html?endTime=' + me.data['end_time'], '完成时间', false, function (data) {
            if (!data) {
                return;
            }
            data = JSON.parse(data);
            me.data['end_time'] = data.endTime;
            $('#doneTime .value').text(editCom.initDoneTime(me.data['end_time']));
            valid.isEdit = oldVal !== me.data['end_time'] ? true : valid.isEdit;
        });
    });

    // 选择人员跳转页面
    $('#principal, #attends').on('click', function (e) {
        var key = '';
        var itemKey = '';
        var oldVal = null;
        if (e.target.id === 'principal') {
            key = principalSelectKey;
            itemKey = 'principal_user';
        }
        else {
            key = attendSelectKey;
            itemKey = 'attend_ids';
        } 
        oldVal = me.data[itemKey];
        CPNavigationBar.redirect('/selector/selector.html?paramId=' + key, '选人', false, function (data) {
            if (!data) {
                return;
            }
            data = JSON.parse(data);
            var contacts = data.contacts;
            if ($.isArray(me.data[itemKey])) {
                contacts.forEach(function (value, index) {
                    me.data[itemKey].push(+users.takeJid(value.jid));
                });
            }
            else {
                me.data[itemKey] = +users.takeJid(contacts[0].jid);
            }

            editCom.personIsChange(oldVal, me.data[itemKey], valid);
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
    var data = $.extend({}, me.data, {
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
                        value: editCom.initDoneTime(me.data['end_time'])
                        /* eslint-enable */
                    },
                    {
                        id: 'urgencyBlock',
                        title: '紧要程度',
                        /* eslint-disable */
                        value: editCom.initImportValue(me.data['importance_level'])
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
    editCom.initImportanceLevel('#urgencyBlock', me);

    // 初始化附件组件
    me.attach = editCom.initEditAttach(me);

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
                contacts: [editCom.transJid(me.data['principal_user'])]
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
                contacts: editCom.transJid(me.data['attend_ids'])
                /* eslint-enable */
            }
        }
    };

    editCom.setChoosePersonLoc(principalSelectKey, pVal);
    editCom.setChoosePersonLoc(attendSelectKey, aVal);
};

/**
 * 请求页面接口
 *
 * @param {deferred} dfd, deferred
 *
 */
/* eslint-disable */
var doing = 'new';
if (doing === 'new') {
    page.data = {
        "id" : 0,
        "title": "",
        "content": "",
        "end_time": 0,
        "importance_level": 1,
        "attend_ids": [],
        "notice": 0,
        "principal_user": 0,
        "attachements": [],
        "message": {
            "sent_eim": true,
            "sent_emai": false,
            "sent_sms": false
        }
    }
}
else {
    page.addParallelTask(function (dfd) {
        var me = this;
        var url = config.API.TASK_EDIT_URL;
        var promise = me.post(url, {
            task_id: util.params('task_id')
        });

        promise
            .done(function (result) {
                if (result.meta.code !== 200) {
                    dfd.reject(result);
                }
                else {
                    me.data = result.data;
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
