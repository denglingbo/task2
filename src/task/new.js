/**
 * @file task.js
 * @author hefeng
 * 新建任务页
 *
 */

require('common/widgets/edit/new.scss');
var editCom = require('common/widgets/edit/editCommon');
var config = require('config');
var Page = require('common/page');
var phoneMid = require('common/phoneMid');
var localStorage = require('common/localstorage');
var PhoneInput = require('common/ui/phoneInput/phoneInput');
// var CPNavigationBar = require('dep/plugins/campo-navigationbar/campo-navigationbar');

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

var principalSelectKey = 'taskPrincipalSelector';
var attendSelectKey = 'taskAttandSelectKey';
var clientMsg = (function () {
    var data = localStorage.getData('TASK_PARAMS');
    return {
        uid: data.uid,
        cid: data.cid,
        client: data.client,
        lang: data.lang,
        puse: data.puse,
        appver: data.appver || '111.1.1'
    };
})();
var selectValue = {
    clientMsg: clientMsg,
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
        valid.content = phoneInputContent.isAllowSubmit();
        valid.title = phoneInputTitle.isAllowSubmit();
        valid.isAttachesReady = attach.isAttachesReady();
        editCom.submitValid(me.submit, valid);
    });

    $('#cancel').on('click', function () {
        editCom.cancelValidate(valid);
    });
    /* eslint-disable */
    // 完成时间跳转页面
    $('#doneTime').on('click', function () {
        CPNavigationBar.redirect('/task/doneTime.html?endTime=' + me.data['end_time'], '完成时间', false, function (data) {
            if (!data) {
                return;
            }
            valid.isEdit = true;
            data = JSON.parse(data);
            me.data['end_time'] = data.endTime;
            $('#doneTime .value').text(me.data['end_time'] ? new Date(me.data['end_time']) : '尽快完成');
        });
    });

    // 选择人员跳转页面
    $('#principal, #attends').on('click', function (e) {
        var key = '';
        var itemKey = '';
        if (e.target.id === 'principal') {
            key = principalSelectKey;
            itemKey = 'principal_user';
        }
        else {
            key = attendSelectKey;
            itemKey = 'attend_ids';
        } 

        CPNavigationBar.redirect('/selector/selector.html?paramId=' + key, '选人', false, function (data) {
            if (!data) {
                return;
            }
            valid.isEdit = true;
            data = JSON.parse(data);
            var contacts = data.contacts;
            if ($.isArray(me.data[itemKey])) {
                contacts.forEach(function (value, index) {
                    me.data[itemKey].push(phoneMid.takeJid(value.jid));
                });
            }
            else {
                me.data[itemKey] = phoneMid.takeJid(contacts[0].jid);
            }
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
    // console.log(template)
    var $content = $('#edit-main');

    var data = $.extend({}, me.data, {
        view: {
            placeholderTitle: '请输入任务标题(必填)',
            placeholderContent: '请输入任务描述(选填)'
        }
    });

    me.render($content, data, {
        partials: {editMain: template}
    });
};

page.initPlugin = function () {
    var me = this;

    // 初始化紧急程度
    editCom.initImportanceLevel('#urgencyBlock', me.data, valid);

    // 初始化附件组件
    attach = editCom.initEditAttach('.attach-list', me.data.attachements, valid);

    // 初始化富文本框

    phoneInputTitle = new PhoneInput({
        handler: '.title-wrap',
        input: '#edit-title',
        limit: 50
    });
    phoneInputContent = new PhoneInput({
        handler: '.content-wrap',
        input: '#edit-content',
        limit: 50000
    });
};

page.initValue = function () {
    var me = this;
    // 设置默认值
    var importanceLevel = ['普通', '重要', '紧急', '重要且紧急'];
    /* eslint-disable */
    $('#urgencyBlock .value').text(importanceLevel[me.data['importance_level'] - 1]);
    $('#doneTime .value').text(me.data['end_time'] ? new Date(me.data['end_time']) : '尽快完成');
    /* eslint-enable */
    // 初始化文本框的关闭按钮
    editCom.initTitleClose(valid);

    // TODO 修改存储数据
    selectValue.selectType = 1;
    localStorage.addData(principalSelectKey, selectValue);
    selectValue.selectType = 2;
    localStorage.addData(attendSelectKey, selectValue);
};

page.submit = function () {
    var me = page;
    var dfd = new $.Deferred();
    me.data.attachements = attach.getModifyAttaches();
    me.data.title = $('#edit-title').val();
    me.data.content = $('#edit-content').text();
    /* eslint-disable */
    var promise = me.post(config.API.TASK_EDIT_URL, me.data);
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
var doing = 'edit';
page.addParallelTask(function (dfd) {
    var me = this;
    var url = doing === 'new' ? config.API.TASK_NEW_URL : config.API.TASK_EDIT_URL;
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
