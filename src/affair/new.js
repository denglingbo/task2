/**
 * @file new.js
 * @author hefeng
 * 新建事件页, 编辑事件页面
 *
 */

require('common/widgets/edit/new.scss');
require('dep/ui/mobiscroll/css/mobiscroll-2.17.0.css');
require('dep/ui/mobiscroll/js/mobiscroll-2.17.0.js');
var editCom = require('common/widgets/edit/editCommon');
var config = require('config');
var Page = require('common/page');
var PhoneInput = require('common/ui/phoneInput/phoneInput');
var util = require('common/util');
// var navigation = require('common/middleware/navigation');
// var MidUI = require('common/middleware/ui');

// 判断是否是编辑页面
var doing = util.params('affairId');

var page = new Page();

/* eslint-disable */
var pageData = {
    id: 0,
    attachs: [],
    message: {
        sentEim: true,
        sentEmai: false,
        sentSms: false
    },
    taskId: util.params('taskId') || 0,
    title: '',
    content: '',
    importanceLevel: 1,
    labelId: 0
};
/* eslint-enable */
page.enter = function () {
    var me = this;
    me.loadPage();
    me.initPlugin();
    me.bindEvents();
};

page.deviceready = function () {
    var me = this;

    // 初始化附件组件
    me.attach = editCom.initEditAttach(pageData.attachs);

    // bindEvents
    editCom.subAndCancel(me.phoneInputTitle, me.phoneInputContent, me.attach, function () {
        pageData.attachs = me.attach.getModifyAttaches();
        var url = pageData.id === 0 ? config.API.AFFAIR_NEW_URL : config.API.AFFAIR_EDIT_URL;
        // editCom.submit(me, url);
        // 事件类型必填
        if (pageData.labelId) {

            var promise = editCom.submit(page, pageData, url);
            promise.done(function (result) {
                // 后端 result.data 返回的是对应的 id, 并非对象
                var affairId = result.data || pageData.affairId;
                /* eslint-disable */
                CPNavigationBar.redirect('/affair-detail.html?id=' + affairId);
                /* eslint-ensable */
            });
        }
    });
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
    var lang = me.lang;
    var data = $.extend({}, pageData, {
        view: [
            {
                id: 'urgencyBlock',
                title: lang.urgentLevel,
                /* eslint-disable */
                value: editCom.initImportValue(pageData['importance_level'])
                /* eslint-enable */
            },
            {
                id: 'affairType',
                title: lang.affairType
            }
        ],
        placeholderTitle: lang.newAffairPlaceholderTitle,
        placeholderContent: lang.newAffairPlaceholderContent
    });

    editCom.loadPage(me, data);
};

page.initPlugin = function () {
    var me = this;
    var lang = me.lang;
    // 初始化紧急程度
    editCom.initImportanceLevel('#urgencyBlock', pageData);

    // 初始化事件标签
    var promise = me.get(config.API.GET_AFFAIR_TAGS);
    promise.done(function (result) {
        if (!result || !result.meta || result.meta.code !== 200) {
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
                value: item['subId'],
                selected: (item['subId'] === pageData['labelId']) && (currName = item.name)
            });
        });
        $('#affairType .value').text(currName);
        /* eslint-enable */
        editCom.initMobiscroll('select', '#affairType', {
            headerText: lang.affairType,
            showInput: false,
            showMe: true,
            rows: 3,
            data: typeData,
            onSelect: function (text, inst) {
                /* eslint-disable */
                var oldVal = pageData['labelId'];
                pageData['labelId'] = inst.getVal();
                $('#affairType .value').text(text);

                editCom.valid.isEdit = oldVal !== pageData['labelId'] ? true : editCom.valid.isEdit;
                /* eslint-enable */
            }
        });
    });

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


page.addParallelTask(function (dfd) {
    var me = this;
    if (!doing) {
        dfd.resolve();
        return dfd;
    }

    var promise = me.get(config.API.AFFAIR_DETAIL_URL, {
        affairId: util.params('affairId')
    });

    promise
        .done(function (result) {
            if (result.meta.code !== 200) {
                dfd.reject(result);
            }
            else {
                util.getDataFromObj(pageData, result.data);
                dfd.resolve();
            }
        });
    return dfd;
});

/* eslint-enable */
page.start();
