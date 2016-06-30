/**
 * @file new.js
 * @author hefeng
 * 新建讨论页, 编辑讨论页面
 *
 */

require('dep/ui/mobiscroll/css/mobiscroll-2.17.0.css');
require('common/widgets/edit/new.scss');
require('dep/ui/mobiscroll/js/mobiscroll-2.17.0.js');
var editCom = require('common/widgets/edit/editCommon');
var config = require('config');
var Page = require('common/page');
var users = require('common/middleware/users/users');
var PhoneInput = require('common/ui/phoneInput/phoneInput');
var util = require('common/util');
// var ls = require('common/localstorage');
var navigation = require('common/middleware/navigation');
// var MidUI = require('common/middleware/ui');
var page = new Page();

var talkId = util.params('talkId');

var DATA = {
    id: 0,
    attachs: [],
    content: '',
    importanceLevel: 4,
    inheritance: true,
    message: {
        sentEim: true,
        sentEmai: false,
        sentSms: false
    },
    taskId: util.params('taskId'),
    title: '',
    userIds: []
};

var selectKey = 'talkAttandSelectKey';

page.enter = function () {
    var me = this;
    me.loadPage();
    me.initPlugin();
    me.bindEvents();
};

page.renderPersonInfo = function () {
    if (DATA.userIds && DATA.userIds.length) {
        var obj = {
            partner: DATA.userIds
        };
        editCom.renderPerson(obj);
    }
};

/**
 * 选择人员
 *
 * @param {Object} chooseData, 选择人员配置
 */
page.choosePerson = function (chooseData) {
    var me = this;
    var oldVal = DATA[chooseData.itemKey];
    navigation.open('/selector-selector.html?paramId=' + chooseData.key, {
        title: me.lang.choosePerson,
        returnParams: function (data) {
            if (!data) {
                return;
            }
            data = JSON.parse(data);
            var contacts = data.contacts;
            DATA.inheritance = false;
            DATA[chooseData.itemKey] = [];
            contacts.forEach(function (value, index) {
                var uid = users.takeJid(value.jid);

                // 避免重复
                if ($.inArray(uid, DATA[chooseData.itemKey]) === -1) {
                    DATA[chooseData.itemKey].push(uid);
                }
            });
            $(chooseData.id + ' .value').text(editCom.getPersonsName(contacts));
            editCom.personIsChange(oldVal, DATA[chooseData.itemKey], chooseData.name);
        }
    });
};

page.deviceready = function () {
    var me = this;

    // 下面为渲染人员信息
    me.renderPersonInfo();

    // 初始化附件组件
    me.attach = editCom.initEditAttach(DATA.attachs);
    // bindEvents
    editCom.subAndCancel(me.phoneInputTitle, me.phoneInputContent, me.attach, function () {
        DATA.attachs = me.attach.getModifyAttaches();
        var url = DATA.id === 0 ? config.API.TALK_NEW_URL : config.API.TALK_EDIT_URL;

        var promise = editCom.submit(page, DATA, url);
        promise.done(function (result) {
            navigation.open(-1, {
                goBackParams: 'refresh'
            });
        });
    }, 'talk', me);

    // 选择人员跳转页面
    $('#attends').click(function () {
        var val = {
            selectType: 2,
            contacts: editCom.transJid(DATA.userIds)
        };
        editCom.setChoosePersonLoc(selectKey, val);

        var options = {
            name: 'attends',
            key: selectKey,
            itemKey: 'userIds',
            id: '#attends'
        };

        me.choosePerson(options);
    });
};

/**
 * 绑定事件
 *
 */
page.bindEvents = function () {};

/**
 * 加载页面
 *
 */
page.loadPage = function () {
    var me = this;
    var lang = me.lang;
    var data = $.extend({}, DATA, {
        view: [
            {
                id: 'urgencyBlock',
                title: lang.urgentLevel,
                value: editCom.initImportValue(DATA.importanceLevel)
            },
            {
                id: 'attends',
                title: lang.attends
            }
        ],
        placeholderTitle: lang.newTalkPlaceholderTitle,
        placeholderContent: lang.newTalkPlaceholderContent
    });

    editCom.loadPage(me, data);
};

page.initPlugin = function () {
    var me = this;
    // 初始化紧急程度
    editCom.initImportanceLevel('#urgencyBlock', DATA);

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
 * 获取请求配置
 *
 * @param {number} talkId, 讨论id
 * @return {Object} 请求信息
 */
page.getRequestData = function (talkId) {
    var requestData = {};
    if (talkId) {
        requestData.api = config.API.TALK_DETAIL_URL;
        requestData.data = {
            talkId: talkId
        };
    }
    else {
        requestData.api = config.API.TASK_DETAIL_URL;
        requestData.data = {
            taskId: util.params('taskId')
        };
    }
    return requestData;
};

/**
 * 处理新建讨论参与人数据，需要把创建人和负责人加入参与人中。
 *
 * @param {Object} data, 任务详情数据
 * @return {Array} 参与人
 */
page.dealData = function (data) {
    var obj = {
        createUser: data.createUser,
        principalUser: data.principalUser,
        userIds: data.attendIds
    };
    var userIds = users.makeArray(obj);
    return userIds;
};

/**
 * 请求页面接口
 *
 * @param {deferred} dfd, deferred
 *
 */
page.addParallelTask(function (dfd) {
    var me = this;
    var request = me.getRequestData(talkId);
    var promise = me.get(request.api, request.data);

    promise
        .done(function (result) {
            if (result.meta.code !== 200) {
                dfd.reject(result);
            }
            else {
                if (!talkId) {
                    DATA.userIds = editCom.unique(me.dealData(result.data));
                }
                else {
                    editCom.getDataFromObj(DATA, result.data);
                }
                dfd.resolve();
            }
        });
    return dfd;
});

page.start();
