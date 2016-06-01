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
var AttachWrapper = require('common/middleware/attach/attachWrapper');

var page = new Page();
var lang = page.lang;

// 验证参数
var valid = {
    isEdited: false
};

/* eslint-disable */
// 提交的数据
var upData = {
    taskId : +util.params('taskId'),
    message: {
        sentEmai: false,
        sentEim: true,
        sentSms: false
    }
}
/* eslint-enable */
/* eslint-disable */
var pages = {
    // 完成任务
    '0': function (isMaster) {
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
    '1': function () {
        return [{
            name: 'cancel',
            holder: lang.cancelReasonPlaceholder
        }];
    },

    // 拒绝
    '2': function () {
        return [{
            name: 'oppose',
            holder: lang.opposeReasonPlaceholder
        }];
    },

    // 同意
    '3': function () {
        return [{
            name: 'agree',
            holder: lang.agreeReasonPlaceholder
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
    var d = null;
    var api = '';
    switch(type) {
        case 0:
            d = {
                attachements: me.attach.getModifyAttaches(),
                completeRemark: $('[data-name=applyReason]').text(),
                summary: $('[data-name=summary]').text()
            };
            api = config.API.SUMMARY_TASK
            break;
        case 1:
            d = {
                suspendRemark: $('[data-name=cancel]').text()
            };
            api = config.API.REVOKE_TASK
            break;
        case 2:
            d = {
                refuseReason: $('[data-name=oppose]').text()
            };
            api = config.API.REFUSE_TASE
            break;
        case 3:
            d = {
                auditRemark: $('[data-name=agree]').text(),
                auditResult: true
            };
            api = config.API.AUDIT_TASK
    }

    return {
        api: api,
        data: $.extend(upData, d)
    }
};

page.enter = function () {
    var me = this;

    // 页面类型
    var pageType = this.pageType = util.params('type');
    
    // 判断是不是 master，完成总结的 master
    var isMaster = parseInt(util.params('master'), 2);

    // 获取当前页面配置
    var curPage = pages[pageType];

    var attachTpl = '';
    if (+pageType === 0) {
        attachTpl = require('common/middleware/attach/attach.tpl')
    }
    var alertBox = require('common/widgets/edit/alert.tpl');
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

    if (+pageType === 0) {
        var attachOptions = {
            containerDOM: '#attachList',
            addBtnDOM: '#addAttach'
        };
        this.attach = AttachWrapper.initAttach(attachOptions);
    }

    me.phoneInput = [];
    $('.phone-input').each(function (i) {
        var limits = 50;
        if (!+pageType && i) {
            limits = 500;
        }
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
        var cancelButton = {
            title: lang.cancel,
            callback: function () {

            }
        };

        var OKButton = {
            title: lang.confirm,
            callback: function () {

            }
        };
        CPUtils.showAlertView('', lang.whetherGiveUpCurrContent, cancelButton, OKButton);
    }
};
page.deviceready = function () {
    var me = this;
    var lang = me.lang;
    // $('#submit').on('click', function () {

    //     var dataArg = me.getData(+me.pageType);
    //     var promise = me.post(dataArg.api, dataArg.data);
    //     var taskId = util.params('taskId');
    //     promise
    //         .done(function (result) {
    //             if (result.meta.code === 200) {
    //                 CPNavigationBar.redirect('/task-detail.html?taskId=' + taskId);
    //             }
    //         })
    //         .fail(function (result) {

    //         });
    // });

    // $('#cancel').on('click', function () {
    //     validEdited(me);
    //     cancelValidate();
    // });

    function submit() {
        var dataArg = me.getData(+me.pageType);
        var promise = me.post(dataArg.api, dataArg.data);
        var taskId = util.params('taskId');
        promise
            .done(function (result) {
                if (result.meta.code === 200) {
                    CPNavigationBar.redirect('/task-detail.html?taskId=' + taskId);
                }
            })
            .fail(function (result) {

            });
    }

    /* eslint-disable */
    CPNavigationBar.setRightButton('xxx', [{
        title: lang.submit,
        iconPath: '',
        callback: submit
    }]);
    function goBack() {
        validEdited(me);
        cancelValidate();
    }
    CPNavigationBar.setLeftButton({
        title : lang.cancel,
        iconPath : '',
        callback : goBack,
        callback: function () {
            CPNavigationBar.returnPreviousPage();
        }
    });
    // CPNavigationBar.setGoBackHandler(goBack,true);
    /* eslint-enable */
};

$(function () {
    page.start();
});
