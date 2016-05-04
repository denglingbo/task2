/**
 * @file talk.js
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

var selectKey = 'talkAttandSelectKey';
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

    editCom.bindTitleClear(valid);

    editCom.bindTitle(valid);

    // editCom.bindContent(valid);

    editCom.bindGetFocus();

    $('#submit').on('click', function () {
        valid.isAttachesReady = attach.isAttachesReady();
        editCom.submitValid(me.submit, valid);
    });

    /* eslint-disable */
    // 选择人员跳转页面
    $('#attends').click(function (e) {
        CPNavigationBar.redirect('selector/selector.html?paramId=' + selectKey, '选人', false, function (data) {
            if (!data) {
                return;
            }
            valid.isEdit = true;
            data = JSON.parse(data);
            var contacts = data.contacts;
            contacts.forEach(function (value, index) {
                me.data['user_ids'].push(phoneMid.takeJid(value.jid));
            });
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
            talk: true,
            placeholder: '讨论'
        }
    }));
};

page.initPlugin = function () {
    var me = this;

    // 初始化紧急程度
    editCom.initImportanceLevel('#urgencyBlock', me.data, valid);

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

    // TODO 修改存储数据
    localStorage.addData(selectKey, selectValue);
};

page.submit = function () {
    var me = page;
    var dfd = new $.Deferred();
    me.data.attachements = attach.getModifyAttaches();
    me.data.title = $('#edit-title').val();
    me.data.content = $('#edit-content').val();
    /* eslint-disable */
    var promise = me.post(config.API.TALK_EDIT_URL, me.data);
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
    var url = doing === 'new' ? config.API.TALK_NEW_URL : config.API.TALK_EDIT_URL;
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
