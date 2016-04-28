/**
 * @file task.js
 * @author hefeng
 * 新建任务页
 *
 */

require('common/widgets/edit/new.scss');
var plugins = require('common/plugins');
var editCom = require('common/widgets/edit/editCommon');
var config = require('config');
var Page = require('common/page');

// var CPNavigationBar = require('dep/campo-navigationbar/campo-navigationbar');

var page = new Page();

var valid = {
    title: false,
    content: true
};

/* eslint-disable */
// 因为后端字段需要
var info = {
    id: '',
    title: '',
    content: '',
    principal_user: 0,
    attend_ids: [],
    end_time: 0,
    importance_level: 1,
    notice: 0,
    message: {
        sent_eim: true,
        sent_emai: false,
        sent_sms: false
    },
    attachements: []
};
/* eslint-enable */
var principalSelectKey = 'taskPrincipalSelector';
var attendSelectKey = 'taskAttandSelectKey';
var selectValue = {
    clientMsg: {
        uid: '',
        cid: '',
        client: '',
        lang: '',
        puse: '',
        appver: ''
    },
    selector: {
        // 选择人
        contact: 3,
        // 选择部门
        dept: 0,
        // 选择职务
        title: 0
    },
    // 选择组件类型：1.单选 2.复选
    selectType: 2,
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
            contacts: [],
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

    editCom.bindClear(valid);

    editCom.bindTitle(valid);

    editCom.bindContent(valid);

    editCom.bindGetFocus();
    $('#submit').on('click', function () {
        me.submit();
    });
    /* eslint-disable */
    // 完成时间跳转页面
    $('#doneTime').on('click', function () {
        CPNavigationBar.redirect('/task/doneTime.html?endTime=' + me.data['end_time'], '完成时间', false, function (data) {
            if (data) {
                data = JSON.parse(data);
            }
            // TODO
        });
    });

    // 选择人员跳转页面
    $('#principal, #attends').on('click', function (e) {
        var key = e.target.id === 'principal' ? principalSelectKey : attendSelectKey;
        CPNavigationBar.redirect('/selector/selector.html?paramId=' + key, '选人', false, function (data) {
            if (data) {
                data = JSON.parse(data);
            }
            // TODO
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
    var template = require('common/widgets/edit/new');
    var $content = $('.edit-container');
    me.renderFile($content, template, $.extend({}, me.data, {
        view: {
            task: true,
            placeholder: '任务'
        }
    }));
};

page.initPlugin = function () {
    var me = this;
    var mobiOptions = {
        theme: 'android-holo-light',
        mode: 'scroller',
        // ios 底部上滑, android 中间显示
        display: (/(iphone|ipad)/i).test(navigator.appVersion) ? 'bottom' : 'modal',
        lang: 'zh',
        buttons: ['cancel', 'set'],
        height: 50
    };

    $('#urgencyBlock').mobiscroll().select($.extend({}, mobiOptions, {
        headerText: '紧急程度',
        showInput: false,
        showMe: true,
        rows: 3,
        data: [
            {
                text: '重要且紧急',
                value: 4
            },
            {
                text: '普通',
                value: 1,
                selected: true
            },
            {
                text: '重要',
                value: 2
            },
            {
                text: '紧急',
                value: 3
            }
        ],
        onSelect: function (text, inst) {
            /* eslint-disable */
            info['importance_level'] = +inst.getVal();
            /* eslint-enable */
            $('#urgencyBlock .value').text(text);
        }
    }));

    // 初始化附件组件
    var attachOptions = {
        // 客户端信息
        clientMsg: {
            uid: '1',
            cid: '1',
            client: '',
            lang: '',
            pause: '',
            appver: '111.1.1'
        },
        // 已经有的附件信息, 没有传空数组, 这个主要是用于修改
        originAttaches: [],
        url: {
            uploadUrl: {
                url: '/mgw/approve/attachment/getFSTokensOnCreate',
                mothod: 'POST'
            },
            resumeUrl: {
                url: '/mgw/approve/attachment/getFSTokensOnContinue',
                mothod: 'POST'
            }
        },
        supportType: [
            // 本地文件
            1,
            // 网盘文件
            2,
            // 相册图片
            3,
            // 拍照上传
            4,
            // 语音上传
            5
        ],
        dom: {
            // 附件容器DOM元素
            containerDOM: '#attachList',
            addBtnDOM: '#addAttach'
        },
        operateType: 'upload',
        attachesCount: 10,
        callback: function () {}
    };
    plugins.initAttach(attachOptions, editCom.transKey(me.data.attachements), '.attach-list');
};

page.initValue = function () {
    var me = this;
    // 设置默认值
    var importanceLevel = ['普通', '重要', '紧急', '重要且紧急'];
    /* eslint-disable */
    $('#urgencyBlock .value').text(importanceLevel[me.data['importance_level']-1]);
    $('#doneTime .value').text(me.data['end_time'] ? new Date(me.data['end_time']) : '尽快完成');
    /* eslint-enable */
    // 初始化文本框的关闭按钮
    $.each($('.input'), function (index, item) {
        editCom.toggleX($(item), $(item).val());
    });

    // TODO 修改存储数据
    selectValue.selectType = 1;
    window.localStorage.setItem(principalSelectKey, JSON.stringify(selectValue));
    selectValue.selectType = 2;
    window.localStorage.setItem(attendSelectKey, JSON.stringify(selectValue));
};

page.submit = function () {
    var me = this;
    info.title = $('#edit-title').val();
    info.content = $('#edit-content').val();
    /* eslint-disable */
    var promise = me.post(config.API.TASK_EDIT_URL, info);
    /* eslint-enable */
};

/**
 * 请求页面接口
 *
 * @param {deferred} dfd, deferred
 *
 */
page.addParallelTask(function (dfd) {
    var me = this;
    var promise = me.post(config.API.TASK_EDIT_URL, {});

    promise
        .done(function (result) {
            if (result.meta !== 0) {
                dfd.reject(result);
            }
            else {
                me.data = result.data;
                if (me.data.id) {
                    info = me.data;
                }
                dfd.resolve();
            }
        });
    return dfd;
});

$(function () {
    page.start();
});
