/**
 * @file submit.js
 * @author deo
 *
 * 提交公用页面
 * 撤销，拒绝，...
 */
require('./submit.scss');

var config = require('config');
var Page = require('common/page');
var util = require('common/util');
var PhoneInput = require('common/ui/phoneInput/phoneInput');
var navigation = require('common/middleware/navigation');
var MidUI = require('common/middleware/ui');
var editCom = require('common/widgets/edit/editCommon');

var page = new Page();
var lang = page.lang;

// 验证参数
var valid = {
    isEdited: false
};

// 提交的数据
var REQUEST_DATA = {
    taskId: util.params('taskId'),
    message: {
        sentEmai: false,
        sentEim: true,
        sentSms: false
    }
};

/* eslint-disable */
var pages = {
    // 完成任务
    summary: function (isMaster) {
        var arr = [{
            name: 'summary',
            holder: lang.taskSummaryPlaceholder
        }];

        if (isMaster === 0) {
            arr.unshift({
                name: 'applyReason',
                holder: lang.applyReasonPlaceholder
            });
        }

        return arr;
    },

    // 撤销
    revoke: function () {
        return [{
            name: 'revoke',
            holder: lang.revokeReasonPlaceholder
        }];
    },

    // 拒绝
    refuse: function () {
        return [{
            name: 'refuse',
            required: true,
            holder: lang.refuseReasonPlaceholder
        }];
    },

    // 同意
    agree: function () {
        return [{
            name: 'agree',
            holder: lang.agreeReasonPlaceholder
        }];
    },

    // 不同意
    notAgree: function () {
        return [{
            name: 'notAgree',
            holder: lang.notAgreeReasonPlaceholder
        }];
    }
};
/* eslint-ensable */

/**
 * 根据传入的type不同选择不同的页面需要的上传数据
 *
 * @param {number} type, 页面类型参数
 * @return {Object}, 返回的上传数据和上传API
 */
page.getData = function (type) {
    var me = this;
    var data = null;
    var api = '';

    var $remark = $('[data-name=applyReason]');
    var $val = $('.phone-input-main');

    switch(type) {

        case 'summary':
            data = {
                attachements: me.attach.getModifyAttaches(),
                completeRemark: $remark && $remark.text() ? $remark.text() : '',
                summary: $('[data-name=summary]').text()
            };

            api = config.API.COMPLETE_TASK;

            break;

        case 'revoke':
            data = {
                suspendRemark: $val.text()
            };

            api = config.API.REVOKE_TASK;

            break;

        case 'refuse':
            data = {
                refuseReason: $val.text()
            };

            api = config.API.REFUSE_TASE;

            break;

        case 'agree':
            data = {
                auditRemark: $val.text(),
                auditResult: true
            };

            api = config.API.AUDIT_TASK;

            break;

        case 'notAgree':
            data = {
                auditRemark: $val.text(),
                auditResult: false
            };

            api = config.API.AUDIT_TASK;
    }

    return {
        api: api,
        data: $.extend(REQUEST_DATA, data)
    };
};

page.enter = function () {

    var me = this;
    // 页面类型
    me.pageType = util.params('type');
    
    // 判断是不是 master，完成总结的 master
    var isMaster = parseInt(util.params('master'), 2);

    // 获取当前页面配置
    var curPage = pages[me.pageType];

    var attachTpl = '';


    var alertBox = require('common/widgets/edit/alert.tpl');
    if (me.pageType === 'summary') {
        attachTpl = require('common/middleware/attach/attach.tpl');
    }
    // 如果没有问题就渲染对应模板
    if (curPage) {
        this.render('#main', {
            list: curPage(isMaster)
        }, {
            partials: {
                attach: attachTpl,
                alertBox: alertBox
            }
        });
    }

    // 总结情景下，提供上传附件功能
    if (me.pageType === 'summary') {
        this.attach = editCom.initEditAttach();
    }

    me.phoneInput = [];

    $('.phone-input').each(function (i) {
        var limits = 500;

        me.phoneInput.push(new PhoneInput({
            handler: this,
            limit: limits
        }));
    });
};

function validEdited(page) {
    page.phoneInput.forEach(function (item) {
        var f = item.isEdited();
        valid.isEdited = f ? f : valid.isEdited;
    });
}

function cancelValidate() {

    if(valid.isEdited) {
        MidUI.alert({
            content: lang.whetherGiveUpCurrContent,
            onApply: function () {
                navigation.open(-1);
            }
        });
        return;
    }

    navigation.open(-1);
};

page.deviceready = function () {
    var me = this;

    function goBack() {
        validEdited(me);
        cancelValidate();
    }

    function submit() {
        var dataArg = me.getData(me.pageType);
        var promise = me.post(dataArg.api, dataArg.data);
        var taskId = util.params('taskId');

        promise
            .done(function (result) {

                if (result && result.meta && result.meta.code === 200) {
                    // navigation.open('/task-detail.html?taskId=' + taskId, {
                    //     title: me.lang.taskDetail
                    // });
                    navigation.open(-1, {
                        goBackParams: 'refresh'
                    });
                }
            })
            .fail(function (result) {
                
            });
    }

    navigation.left({
        title: me.lang.cancel,
        click: goBack
    });

    navigation.right([
        {
            title: me.lang.submit,
            click: submit
        }
    ]);

    // CPNavigationBar.setGoBackHandler(goBack,true);
};

$(window).on('load', function () {
    page.start();
});
