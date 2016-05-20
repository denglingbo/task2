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

var page = new Page({
    pageName: 'form-submit'
});

// 验证参数
var valid = {
    isEdited: false
};

/* eslint-disable */
// 提交的数据
var upData = {
    task_id : +util.params('task_id'),
    message: {
        sent_emai: false,
        sent_eim: true,
        sent_sms: false
    }
}
/* eslint-enable */
/* eslint-disable */
var pages = {
    // 完成任务
    '0': function (isMaster) {
        var arr = [{
            name: 'summary',
            holder: '请输入任务总结(选填)'
        }];

        if (isMaster === 0) {
            arr.unshift({
                name: 'applyReason',
                holder: '请输入申请理由(选填)'
            });
        }

        return arr;
    },

    // 撤销
    '1': function () {
        return [{
            name: 'cancel',
            holder: '请输入撤销理由'
        }];
    },

    // 拒绝
    '2': function () {
        return [{
            name: 'oppose',
            holder: '请输入拒绝理由'
        }];
    },

    // 同意
    '3': function () {
        return [{
            name: 'agree',
            holder: '请输入同意理由'
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
                complete_remark: $('[data-name=applyReason]').text(),
                summary: $('[data-name=summary]').text()
            };
            api = config.API.SUMMARY_TASK
            break;
        case 1:
            d = {
                suspend_remark: $('[data-name=cancel]').text()
            };
            api = config.API.REVOKE_TASK
            break;
        case 2:
            d = {
                refuse_reason: $('[data-name=oppose]').text()
            };
            api = config.API.REFUSE_TASE
            break;
        case 3:
            d = {
                audit_remark: $('[data-name=agree]').text(),
                audit_result: true
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
            dom: {
                containerDOM: '#attachList',
                addBtnDOM: '#addAttach'
            },
            operateType: 'upload'
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
            title: '取消',
            callback: function () {

            }
        };

        var OKButton = {
            title: '确认',
            callback: function () {

            }
        };
        CPUtils.showAlertView('', '确认放弃当前添加的内容', cancelButton, OKButton);
    }
};
page.deviceready = function () {
    var me = this;
    
    $('#submit').on('click', function () {

        var dataArg = me.getData(+me.pageType);
        var promise = me.post(dataArg.api, dataArg.data);
        var taskId = util.params('task_id');
        promise
            .done(function (result) {
                if (result.meta.code === 200) {
                    CPNavigationBar.redirect('/task-detail.html?task_id=' + taskId);
                }
            })
            .fail(function (result) {

            });
    });

    $('#cancel').on('click', function () {
        validEdited(me);
        cancelValidate();
    })
};

$(function () {
    page.start();
});
