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
var phoneMid = require('common/phoneMid');
var localStorage = require('common/localstorage');
var PhoneInput = require('common/ui/phoneInput/phoneInput');
// var CPNavigationBar = require('dep/campo-navigationbar/campo-navigationbar');

var page = new Page();

// 附件对象
var attach = null;

// 富文本对象
var phoneInputTitle = null;
var phoneInputContent = null;

// 验证信息
var valid = {
    isEdit: false,
    title: false,
    content: true,
    isAttachesReady: true
};

var selectKey = 'talkAttandSelectKey';
var selectValue = {
    clientMsg: editCom.getClientMsg(),
    selector: {
        // 选择人
        contact: 2
    },
    // 选择组件类型：1.单选 2.复选
    selectType: 2,
    // 指定的过滤数据
    filter: {
        // 指定不显示的数据
        disabled: {
            contacts: []
        },
        // 已选择的数据
        checked: {
            // 数组
            contacts: []
        }
    },
    // 数据源：1.通过原生插件获取 2.从移动网关服务器获取
    dataSource: 1
};

page.enter = function () {
    var me = this;
    me.loadPage();
    me.initPlugin();
    me.initValue();
    me.bindEvents();
};

/**
 * 绑定事件
 *
 */
page.bindEvents = function () {
    var me = this;

    editCom.bindGetFocus();

    editCom.subAndCancel(phoneInputTitle, phoneInputContent, attach, valid, function () {
        editCom.submit(me, me.data, attach, config.API.TALK_EDIT_URL);
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
                me.data['user_ids'].push(+phoneMid.takeJid(value.jid));
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
    editCom.initImportanceLevel('#urgencyBlock', me.data, valid);

    // 初始化附件组件
    attach = editCom.initEditAttach('.attach-list', me.data.attachements, valid);

    // 初始化富文本框
    phoneInputTitle = new PhoneInput({
        'handler': '.title-wrap',
        'input': '#edit-title',
        'limit': 50,
        'delete': true
    });

    phoneInputContent = new PhoneInput({
        'handler': '.content-wrap',
        'input': '#edit-content',
        'limit': 5000,
        'delete': true
    });
};

page.initValue = function () {
    // TODO 修改存储数据
    selectValue.flter = {
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
    };
    localStorage.addData(selectKey, selectValue);
};

/**
 * 请求页面接口
 *
 * @param {deferred} dfd, deferred
 *
 */
var doing = 'new';
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
