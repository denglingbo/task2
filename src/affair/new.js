/**
 * @file affair.js
 * @author hefeng
 * 新建事件页, 编辑事件页面
 *
 */

require('common/widgets/edit/new.scss');
var plugins = require('common/plugins');
var editCom = require('common/widgets/edit/editCommon');
var config = require('config');
var Page = require('common/page');

// var CPNavigationBar = require('dep/campo-navigationbar/campo-navigationbar');

var page = new Page();

// 附件对象
var attach = null;

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
    me.initValue();
    me.bindEvents();
};

/**
 * 绑定事件
 *
 */
page.bindEvents = function () {
    var me = this;
    editCom.bindTitleClear(valid);

    editCom.bindTitle(valid);

    // editCom.bindContent(valid);

    editCom.bindGetFocus();

    $('#submit').on('click', function () {
        valid.isAttachesReady = attach.isAttachesReady();
        editCom.submitValid(me.submit, valid);
    });
};

/**
 * 加载页面
 *
 */
page.loadPage = function () {
    var me = this;

    var template = require('common/widgets/edit/new');
    var $content = $('.edit-container');
    me.renderFile($content, template, $.extend({}, me.data, {
        view: {
            affair: true,
            placeholder: '事件'
        }
    }));
};

page.initPlugin = function () {
    var me = this;
    // 初始化紧急程度
    editCom.initImportanceLevel('#urgencyBlock', me.data, valid);

    // 事件类型
    plugins.initMobiscroll('#affairType', {
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
            me.data['label_id'] = +inst.getVal();
            /* eslint-enable */
            $('#affairType .value').text(text);

            valid.isEdit = true;
        }
    });

    // 初始化附件组件
    attach = editCom.initEditAttach('.attach-list', me.data.attachements, valid);
};

page.initValue = function () {
    var me = this;
    // 设置默认值
    var importanceLevel = ['重要且紧急', '普通', '重要', '紧急'];
    /* eslint-disable */
    $('#urgencyBlock .value').text(importanceLevel[me.data['importance_level']]);
    /* eslint-enable */
    // 初始化文本框的关闭按钮
    editCom.initTitleClose(valid);
};

page.submit = function () {
    var me = page;
    var dfd = new $.Deferred();
    me.data.attachements = attach.getModifyAttaches();
    me.data.title = $('#edit-title').val();
    me.data.content = $('#edit-content').val();
    /* eslint-disable */
    var promise = me.post(config.API.AFFAIR_EDIT_URL, me.data);
    console.log(me.data);
    promise
        .done(function (result) {
            if (result.meta.code !== 200) {
                dfd.reject(result);
            } 
            else {
                // TODO
                dfd.resolve();
            }
        }).fail(function (result) {
            // TODO
            // console.log(result);
        });
    /* eslint-enable */
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
    var promise = page.post(url);

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
