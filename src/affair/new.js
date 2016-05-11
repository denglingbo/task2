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
var util = require('common/util');
// var CPNavigationBar = require('dep/campo-navigationbar/campo-navigationbar');

var page = new Page();

// 验证信息
page.valid = {
    isEdit: false,
    title: false,
    content: true,
    isAttachesReady: true
};

page.enter = function () {
    var me = this;
    me.loadPage();
    me.bindEvents();
    me.initPlugin();
};

/**
 * 绑定事件
 *
 */
page.bindEvents = function () {
    var me = this;

    editCom.bindGetFocus();

    editCom.subAndCancel(me, function () {
        me.data.attachs = me.attach.getModifyAttaches();
        var url = me.data.id === 0 ? config.API.AFFAIR_NEW_URL : config.API.AFFAIR_EDIT_URL;
        editCom.submit(me, url);
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
                title: '事件类型'
            }
        ],
        placeholderTitle: '请输入任务标题(必填)',
        placeholderContent: '请输入任务描述(选填)'
    });

    editCom.loadPage(me, data);
};

page.initPlugin = function () {
    var me = this;
    var valid = me.valid;
    // 初始化紧急程度
    editCom.initImportanceLevel('#urgencyBlock', me);

    // 初始化事件标签
    var promise = me.get(config.API.GET_AFFAIR_TAGS);
    promise.done(function (result) {
        if (result.meta.code !== 200) {
            return;
        }
        var currName = '';
        // 事件类型
        me.affairType = result.data;
        var typeData = [];
        /* eslint-disable */
        me.affairType.forEach(function (item) {
            typeData.push({
                text: item.name,
                value: item['sub_id'],
                selected: (item['sub_id'] === me.data['label_id']) && (currName = item.name)
            });
        });
        $('#affairType .value').text(currName);
        /* eslint-enable */
        editCom.initMobiscroll('select', '#affairType', {
            headerText: '事件类型',
            showInput: false,
            showMe: true,
            rows: 3,
            data: typeData,
            onSelect: function (text, inst) {
                /* eslint-disable */
                var oldVal = me.data['label_id'];
                me.data['label_id'] = +inst.getVal();
                $('#affairType .value').text(text);

                valid.isEdit = oldVal !== me.data['label_id'] ? true : valid.isEdit;
                /* eslint-enable */
            }
        });
    });

    // 初始化附件组件
    me.attach = editCom.initEditAttach(me, me.data.attachs);

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

/**
 * 请求页面接口
 *
 * @param {deferred} dfd, deferred
 *
 */
/* eslint-disable */
var doing = +util.params('affair_id');
page.data = {
    "id": 0,
    "attachs": [],
    "message" : {
        "sent_eim": true,
        "sent_emai": false,
        "sent_sms": false
    },
    "task_id": +util.params('task_id') || 0,
    "title": "",
    "content": "",
    "importance_level": 1,
    "label_id": 1506
}

if (doing) {
    page.addParallelTask(function (dfd) {
        var me = this;
        var url = config.API.AFFAIR_DETAIL_URL;
        var promise = me.get(url, {
            affair_id: +util.params('affair_id')
        });

        promise
            .done(function (result) {
                if (result.meta.code !== 200) {
                    dfd.reject(result);
                }
                else {
                    util.getDataFromObj(me.data, result.data);
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
