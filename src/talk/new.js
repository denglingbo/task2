/**
 * @file new.js
 * @author hefeng
 * 新建讨论页, 编辑讨论页面
 *
 */

require('common/widgets/edit/new.scss');
require('dep/ui/mobiscroll/css/mobiscroll-2.17.0.css');
require('dep/ui/mobiscroll/js/mobiscroll-2.17.0.js');
var editCom = require('common/widgets/edit/editCommon');
var config = require('config');
var Page = require('common/page');
var users = require('common/middleware/users/users');
var PhoneInput = require('common/ui/phoneInput/phoneInput');
var util = require('common/util');
var ls = require('common/localstorage');
var navigation = require('common/middleware/navigation');
// var MidUI = require('common/middleware/ui');

// 判断是否是编辑页面
var doing = util.params('talkId');

var page = new Page();

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
    taskId: util.params('taskId') || 0,
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

page.deviceready = function () {
    var me = this;
    var lang = me.lang;

    // 下面为获取人员信息的配置
    if (DATA.userIds.length) {
        var obj = {
            partner: DATA.userIds
        };
        var cid = ls.getData(config.const.PARAMS).cid;
        var jids = users.makeArray(obj);
        var dfdPub = users.getUserInfo(jids, cid);

        // 查询用户信息失败
        if (dfdPub === null) {
            me.userInfoFail = true;
        }
        else {
            dfdPub
                .done(function (pubData) {
                    me.renderUser(pubData.contacts);
                })
                .fail(function () {
                    me.failUser();
                });
        }
    }


    // 初始化附件组件
    me.attach = editCom.initEditAttach(DATA.attachs);

    // bindEvents
    editCom.subAndCancel(me.phoneInputTitle, me.phoneInputContent, me.attach, function () {
        DATA.attachs = me.attach.getModifyAttaches();
        var url = DATA.id === 0 ? config.API.TALK_NEW_URL : config.API.TALK_EDIT_URL;

        var promise = editCom.submit(page, DATA, url);
        promise.done(function (result) {
            // var talkId = result.data || DATA.id;
            // 后端 result.data 返回的是对应的 id, 并非对象
            navigation.open(-1, {
                goBackParams: 'refresh'
            });
        });
    });

    // 选择人员跳转页面
    $('#attends').click(function () {
        var val = {
            selectType: 2,
            contacts: editCom.transJid(DATA.userIds)
        };
        editCom.setChoosePersonLoc(selectKey, val);

        var oldVal = DATA.userIds;
        navigation.open('/selector-selector.html?paramId=' + selectKey, {
            title: lang.choosePerson,
            returnParams: function (data) {
                if (!data) {
                    return;
                }
                DATA.inheritance = false;
                data = JSON.parse(data);
                var contacts = data.contacts;
                DATA.userIds = [];
                contacts.forEach(function (value, index) {
                    var uid = users.takeJid(value.jid);

                    // 避免重复
                    if ($.inArray(uid, DATA.userIds) === -1) {
                        DATA.userIds.push(uid);
                    }
                });
                $('#attends .value').text(editCom.getPersonsName(contacts));
                editCom.personIsChange(oldVal, DATA.userIds);
            }
        });
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
 * 成员获取失败
 *
 */
page.failUser = function () {
    var me = this;
    var lang = me.lang;
    $('#attends .value').html(lang.dataLoadFailPleaseReLoad);
};

/**
 * 渲染成员数据
 *
 * @param {Array} dataArr, 匹配到的数据
 *
 */
page.renderUser = function (dataArr) {

    var dataRaw = {};

    // 成员数据
    if (dataArr.length) {
        var partnerRaw = [];
        dataArr.forEach(function (item) {
            partnerRaw.push(item.name);
        });

        dataRaw.partnerRaw = partnerRaw.join('、');
    }

    $('#attends .value').text(dataRaw.partnerRaw);
};

/**
 * 请求页面接口
 *
 * @param {deferred} dfd, deferred
 *
 */
page.addParallelTask(function (dfd) {
    var me = this;
    var promise;
    if (!doing) {
        promise = me.get(config.API.TASK_DETAIL_URL, {
            taskId: util.params('taskId')
        });
    }
    else {
        promise = me.get(config.API.TALK_DETAIL_URL, {
            talkId: util.params('talkId')
        });
    }

    promise
        .done(function (result) {
            if (result.meta.code !== 200) {
                dfd.reject(result);
            }
            else {
                if (!doing) {
                    DATA.userIds = result.data.attendIds;
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
