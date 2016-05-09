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
// var CPNavigationBar = require('dep/campo-navigationbar/campo-navigationbar');

var page = new Page();

// 验证信息
page.valid = {
    isEdit: false,
    title: false,
    content: true,
    isAttachesReady: true
};

var selectKey = 'talkAttandSelectKey';

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
        editCom.submit(me, config.API.TALK_EDIT_URL);
    });

    /* eslint-disable */
    // 选择人员跳转页面
    $('#attends').click(function () {
        var oldVal = me.data['user_ids'];
        CPNavigationBar.redirect('selector/selector.html?paramId=' + selectKey, '选人', false, function (data) {
            if (!data) {
                return;
            }
            data = JSON.parse(data);
            var contacts = data.contacts;
            contacts.forEach(function (value, index) {
                me.data['user_ids'].push(+users.takeJid(value.jid));
            });
            editCom.personIsChange(oldVal, me.data['user_ids'], valid);
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
                id: 'urgencyBlock',
                title: '紧要程度',
                /* eslint-disable */
                value: editCom.initImportValue(me.data['importance_level'])
                /* eslint-enable */
            },
            {
                id: 'attends',
                title: '参与人'
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
                contacts: editCom.transJid(me.data['attend_ids'])
                /* eslint-enable */
            }
        }
    };

    editCom.setChoosePersonLoc(selectKey, val);
};

/**
 * 请求页面接口
 *
 * @param {deferred} dfd, deferred
 *
 */
var doing = 'edit';
page.addParallelTask(function (dfd) {
    var me = this;
    var url = doing === 'new' ? config.API.TALK_NEW_URL : config.API.TALK_EDIT_URL;
    var promise = me.post(url);

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

$(function () {
    page.start();
});
