/**
 * @file new.js
 * @author hefeng
 * 新建任务页
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
var taskId = util.params('taskId');

var page = new Page();

var DATA = {
    id: 0,
    title: '',
    content: '',
    endTime: 0,
    importanceLevel: 4,
    notice: 0,
    attachements: [],

    attendIds: [],
    principalUser: 0,

    message: {
        sentEim: true,
        sentEmai: false,
        sentSms: false
    }
};

var principalSelectKey = 'taskPrincipalSelector';
var attendSelectKey = 'taskAttandSelectKey';

page.enter = function () {
    var me = this;
    me.loadPage();
    me.initPlugin();
    me.bindEvents();
};

page.deviceready = function () {
    var me = this;
    var lang = me.lang;

    if (taskId) {
        // 下面为获取人员信息的配置
        var obj = {
            principal: DATA.principalUser,
            partner: DATA.attendIds
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
                    me.renderUser(obj, pubData.contacts);
                })
                .fail(function () {
                    me.failUser();
                });
        }
    }
    // 完成时间跳转页面
    $('#doneTime').on('click', function () {
        var oldVal = DATA.endTime;

        navigation.open('/task-doneTime.html?endTime=' + DATA.endTime, {
            title: lang.doneTime,
            returnParams: function (data) {
                if (!data) {
                    return;
                }
                data = JSON.parse(data);
                DATA.endTime = data.endTime;
                $('#doneTime .value').text(
                    editCom.initDoneTime(DATA.endTime)
                );
                editCom.valid.isEdit = oldVal !== DATA.endTime ? true : editCom.valid.isEdit;
            }
        });
    });

    function person(key, itemKey, id) {
        var oldVal = DATA[itemKey];

        navigation.open('/selector-selector.html?paramId=' + key, {
            title: lang.choosePerson,
            returnParams: function (data) {
                if (!data) {
                    return;
                }

                data = JSON.parse(data);
                var contacts = data.contacts;

                // if ($.isArray(DATA[itemKey])) {
                // 参与人
                if (itemKey === 'attendIds') {
                    // 使用选人组件传递的新的数据
                    DATA[itemKey] = [];

                    contacts.forEach(function (value, index) {
                        var uid = users.takeJid(value.jid);

                        // 避免重复
                        if ($.inArray(uid, DATA[itemKey]) === -1) {
                            DATA[itemKey].push(uid);
                        }
                    });
                }
                // 负责人
                else {
                    DATA[itemKey] = users.takeJid(contacts[0].jid);
                }
                // 对应的点击栏容器
                $(id + ' .value').text(editCom.getPersonsName(contacts));

                editCom.personIsChange(oldVal, DATA[itemKey]);
            }
        });
    }
    $('#principal, #attends').on('click', function (e) {
        var key = '';
        var itemKey = '';
        var id = '';

        if ($(this).attr('id') === 'principal') {
            editCom.setChoosePersonLoc(principalSelectKey, {
                selectType: 1,
                contacts: editCom.transJid(DATA.principalUser)
            });

            key = principalSelectKey;
            itemKey = 'principalUser';
            id = '#principal';
        }
        else {
            editCom.setChoosePersonLoc(attendSelectKey, {
                selectType: 2,
                contacts: editCom.transJid(DATA.attendIds)
            });

            key = attendSelectKey;
            itemKey = 'attendIds';
            id = '#attends';
        }
        person(key, itemKey, id);
    });

    me.ajaxAttach();
};

/**
 * 绑定事件
 *
 */
page.bindEvents = function () {

};

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
                persons: [
                    {
                        id: 'principal',
                        title: lang.principal
                    },
                    {
                        id: 'attends',
                        title: lang.attends
                    }
                ]
            },
            {
                options: [
                    {
                        id: 'doneTime',
                        title: lang.doneTime,
                        value: editCom.initDoneTime(DATA.endTime)
                    },
                    {
                        id: 'urgencyBlock',
                        title: lang.urgentLevel,
                        value: editCom.initImportValue(DATA.importanceLevel)
                    }
                ]
            }
        ],
        placeholderTitle: lang.newTaskPlaceholderTitle,
        placeholderContent: lang.newTaskPlaceholderContent
    });

    editCom.loadPage(me, data);
};

page.bindTopEvent = function () {
    var me = this;
    editCom.subAndCancel(me.phoneInputTitle, me.phoneInputContent, me.attach, function () {
        DATA.attachements = me.attach.getModifyAttaches();
        DATA.attendIds = editCom.unique(DATA.attendIds);
        var url = DATA.id === 0 ? config.API.TASK_NEW_URL : config.API.TASK_EDIT_URL;
        var promise = editCom.submit(page, DATA, url);

        promise.done(function (result) {
            navigation.open(-1, {
                goBackParams: 'refresh'
            });
        });
    });
};

/**
 * 加载附件
 *
 */
page.loadAttach = function () {
    var me = this;
    var attachList = [];
    if (me.attachData && me.attachData.objList && me.attachData.objList.length) {
        attachList = me.attachData.objList;
    }
    me.attach = editCom.initEditAttach(attachList);
    me.bindTopEvent();
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

// 来自于deo, 获取人员信息
/**
 * 查找某子对象是否属于源数据对象，同时把对应的数据附加到 appendObject 上
 *
 * @param {Object} srcObject, 源数据对象
 * @param {Object} itemObject, 子对象
 * @param {Object} appendObject, 匹配到某对象上
 *
 */
page.findOwner = function (srcObject, itemObject, appendObject) {

    if (itemObject && itemObject.jid) {

        var id = parseInt(users.takeJid(itemObject.jid), 10);

        for (var key in srcObject) {
            if (srcObject.hasOwnProperty(key)) {

                var objIds = srcObject[key];

                if ($.isArray(objIds) && $.inArray(id, objIds) !== -1) {

                    var appender = appendObject[key];
                    if (!$.isArray(appender)) {
                        appendObject[key] = [];
                    }

                    itemObject && appendObject[key].push(itemObject);
                }
                // 非数组直接判断是否相等
                else if (objIds === id) {
                    appendObject[key] = itemObject;
                }

            }
        }
    }
};

/**
 * 成员获取失败
 *
 */
page.failUser = function () {
    var me = this;
    $('#attends .value').html(me.lang.dataLoadFailPleaseReLoad);
};

/**
 * 渲染成员数据
 *
 * @param {Array} originArr, 原始数组数据 jids，未merge 过的数组
 * @param {Array} dataArr, 匹配到的数据
 *
 */
page.renderUser = function (originArr, dataArr) {
    var me = this;
    var data = {
        principal: null,
        partner: null
    };

    dataArr.forEach(function (item) {
        me.findOwner(originArr, item, data);
    });

    var dataRaw = {};

    // 负责人数据
    if (data.principal && data.principal.name) {
        dataRaw.principal = data.principal.name;
    }

    // 成员数据
    if (data.partner) {
        var partnerRaw = [];
        data.partner.forEach(function (item) {
            partnerRaw.push(item.name);
        });
        partnerRaw = editCom.unique(partnerRaw);
        dataRaw.partnerRaw = partnerRaw.join('、');
    }

    $('#principal .value').text(dataRaw.principal);
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

    if (!taskId) {
        dfd.resolve();
        return dfd;
    }

    var promise = me.get(config.API.TASK_DETAIL_URL, {
        taskId: taskId
    });

    promise
        .done(function (result) {
            if (result.meta.code !== 200) {
                dfd.reject(result);
            }
            else {
                editCom.getDataFromObj(DATA, result.data);
                dfd.resolve();
            }
        });
    return dfd;
});

/**
 * 请求附件列表
 *
 * @param {deferred} dfd, deferred
 *
 */
page.ajaxAttach = function () {
    var me = this;
    if (!taskId) {
        me.loadAttach();
        return;
    }
    var promise = page.get(config.API.ATTACH_LIST, {
        taskId: taskId,
        currPage: 1,
        number: 1000
    });

    promise
        .done(function (result) {
            if (result.meta && result.meta.code === 200) {
                me.attachData = result.data;
            }
        })
        .fail(function (err) {
            // console.log(err);
        })
        .always(function () {
            me.loadAttach();
        });
};

page.start();
