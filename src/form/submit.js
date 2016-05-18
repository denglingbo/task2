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

    // 页面类型
    var pageType = this.pageType = util.params('type');
    
    // 判断是不是 master，完成总结的 master
    var isMaster = parseInt(util.params('master'), 2);

    // 获取当前页面配置
    var curPage = pages[pageType];

    var childTpl = '';
    if (+pageType === 0) {
        childTpl = '<div class="edit-attach">'
                 +     '<div id="addAttach" class="edit-add-attach">'
                 +          '<i class="add-attach"></i>'
                 +          '<span>添加附件</span>'
                 +     '</div>'
                 +     '<div id="attachList" class="attach-list"></div>'
                 + '</div>';
    }
    // 如果没有问题就渲染对应模板
    if (curPage) {
        this.render('#main', {
            list: curPage(isMaster)
        }, {
            partials: {attach: childTpl}
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
    // 这里两个输入框的 limit 相同，所以都用一样的配置
    $('.phone-input').each(function (i) {
        var limits = 50;
        if (!+pageType && !i) {
            limits = 500;
        }
        new PhoneInput({
            handler: this,
            limit: limits
        });
    });

    this.bindEvents();
};

page.bindEvents = function () {
    var me = this;
    
    $('#submit').on('click', function () {
        var dataArg = me.getData(+me.pageType);
        var promise = me.post(dataArg.api, dataArg.data);
        promise
            .done(function (result) {
                if (result.meta.code === 200) {
                    CPNavigationBar.redirect('/task/detail.html?task_id=' + taskId);
                }
            })
            .fail(function (result) {

            });
    })
};

$(function () {
    page.start();
});
