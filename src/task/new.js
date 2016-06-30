/**
 * @file new.js
 * @author hefeng
 * 新建任务页
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

// 判断是否是编辑页面
var taskId = util.params('taskId');

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

var choosePersonData = {
    principal: function () {
        return {
            name: 'principal',
            key: principalSelectKey,
            itemKey: 'principalUser',
            id: '#principal',
            setOptions: function () {
                var me = this;
                editCom.setChoosePersonLoc(me.key, {
                    selectType: 1,
                    contacts: editCom.transJid(DATA[me.itemKey])
                });
            }
        };
    },
    attends: function () {
        return {
            name: 'attends',
            key: attendSelectKey,
            itemKey: 'attendIds',
            id: '#attends',
            setOptions: function () {
                var me = this;
                editCom.setChoosePersonLoc(me.key, {
                    selectType: 2,
                    contacts: editCom.transJid(DATA[me.itemKey])
                });
            }
        };
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
            var jid = 0;

            // 参与人
            if (chooseData.name === 'attends') {
                // 使用选人组件传递的新的数据
                DATA[chooseData.itemKey] = [];

                contacts.forEach(function (value, index) {
                    var uid = users.takeJid(value.jid);

                    // 避免重复
                    if ($.inArray(uid, DATA[chooseData.itemKey]) === -1) {
                        DATA[chooseData.itemKey].push(uid);
                    }
                });
            }
            // 负责人
            else {
                if (taskId && !contacts.length) {
                    return;
                }
                jid = contacts[0] ? contacts[0].jid : 0;
                DATA[chooseData.itemKey] = users.takeJid(jid);
            }
            $(chooseData.id + ' .value').text(editCom.getPersonsName(contacts));
            editCom.personIsChange(oldVal, DATA[chooseData.itemKey], chooseData.name);
        }
    });
};

/**
 * 渲染人员信息
 *
 * @param {number} taskId, 任务id
 */
page.renderPersonInfo = function (taskId) {
    if (!taskId) {
        return;
    }

    // 下面为获取人员信息的配置
    var obj = {
        principal: DATA.principalUser,
        partner: DATA.attendIds
    };
    editCom.renderPerson(obj);
};

page.enter = function () {
    var me = this;
    me.loadPage();
    me.initPlugin();
    me.bindEvents();
};

page.deviceready = function () {
    var me = this;
    var lang = me.lang;
    me.renderPersonInfo(taskId);

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

    // 选择人员
    $('#principal, #attends').on('click', function (e) {
        var id = $(this).attr('id');
        var chooseData = choosePersonData[id]();
        chooseData.setOptions();
        me.choosePerson(chooseData);
    });

    // 请求附件
    me.ajaxAttach();
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
    }, 'task', me);
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

page.start();
