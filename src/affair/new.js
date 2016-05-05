/**
 * @file new.js
 * @author hefeng
 * 新建事件页, 编辑事件页面
 *
 */

require('common/widgets/edit/new.scss');
var editCom = require('common/widgets/edit/editCommon');
var config = require('config');
var Page = require('common/page');
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

page.enter = function () {
    var me = this;
    me.loadPage();
    me.initPlugin();
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
        editCom.submit(me, me.data, attach, config.API.AFFAIR_EDIT_URL);
    });
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
                id: 'affairType',
                title: '事件类型',
                /* eslint-disable */
                value: editCom.initAffairType(me.data['label_id'])
                /* eslint-enable */
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

    // 事件类型
    editCom.initMobiscroll('select', '#affairType', {
        headerText: '事件类型',
        showInput: false,
        showMe: true,
        rows: 3,
        data: [
            {
                text: '待办',
                value: 0
            },
            {
                text: '求助',
                value: 1,
                selected: true
            },
            {
                text: '汇报',
                value: 2
            },
            {
                text: '计划',
                value: 3
            },
            {
                text: '日志',
                value: 4
            },
            {
                text: '记录',
                value: 5
            },
            {
                text: '消息',
                value: 6
            },
            {
                text: '其他',
                value: 7
            }
        ],
        onSelect: function (text, inst) {
            /* eslint-disable */
            var oldVal = me.data['label_id'];
            me.data['label_id'] = +inst.getVal();
            $('#affairType .value').text(text);

            valid.isEdit = oldVal !== me.data['label_id'] ? true : valid.isEdit;
            /* eslint-enable */
        }
    });

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

/**
 * 请求页面接口
 *
 * @param {deferred} dfd, deferred
 *
 */
var doing = 'new';
page.addParallelTask(function (dfd) {
    var me = this;
    var url = doing === 'new' ? config.API.AFFAIR_NEW_URL : config.API.AFFAIR_EDIT_URL;
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
