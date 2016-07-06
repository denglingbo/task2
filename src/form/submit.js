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
var AttachWrapper = require('common/middleware/attach/attachWrapper');

var alertTpl = require('common/widgets/edit/alert.tpl');
var attachTpl = require('common/middleware/attach/attach.tpl');

var page = new Page();
var lang = page.lang;
var isCanSubmit = true;
var $attachList = null;
var rightTimmer = null;

// 验证参数
var valid = {
    isEdited: false
};

// 提交的数据
var REQUEST_DATA = {
    taskId: util.params('taskId') || 0,
    message: {
        sentEmai: false,
        sentEim: true,
        sentSms: false
    }
};

var pages = {
    // 完成任务 总结
    summary: function (isMaster) {
        var arr = [{
            name: 'summary',
            holder: lang.taskSummaryPlaceholder
        }];

        if (isMaster === 0) {
            arr.push({
                name: 'applyReason',
                holder: lang.applyReasonPlaceholder
            });
        }

        return arr;
    },

    // 讨论总结
    talkSummary: function () {
        return [{
            name: 'summary',
            holder: lang.talkSummaryPlaceholder
        }];
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

var actionsTag = {
    // 完成任务 总结
    summary: 'summarySubmit',

    // 讨论总结
    talkSummary: 'talkSummarySubmit',

    // 撤销
    revoke: 'revokeSubmit',

    // 拒绝
    refuse: 'refuseSubmit',

    // 同意
    agree: 'auditSubmit',

    // 不同意
    notAgree: 'auditSubmit'
};

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

    switch (type) {

        case 'summary':
            data = {
                attachements: me.attach.getModifyAttaches(),
                completeRemark: $remark && $remark.text() ? $remark.text() : '',
                summary: $('[data-name=summary]').text()
            };

            api = config.API.COMPLETE_TASK;

            break;

        case 'talkSummary':
            data = {
                attachements: me.attach.getModifyAttaches(),
                summary: $('[data-name=summary]').text(),
                // 后端需要和 web 端保持一致
                closeTalk: false
            };

            api = config.API.TALK_SUMMARY;

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
    var myPage = pages[me.pageType];

    if (/summary|talkSummary/.test(me.pageType)) {

        var api;
        var rdata = {};

        // summary
        if (me.pageType === 'summary') {
            api = config.API.TASK_SUMMARY_GET;
            rdata = {
                taskId: util.params('taskId')
            };
        }
        // talkSummary
        else {
            api = config.API.TALK_SUMMARY_GET;
            rdata = {
                talkId: util.params('talkId')
            };
        }

        // 编辑状态总结
        var promise = page.get(api, rdata);

        promise.done(function (result) {

            if (result && result.meta && result.meta.code === 200) {

                var data = result.data;
                var arr = myPage(isMaster);

                // 判断是否有数据
                if (data) {
                    if (data.summary && data.summary.length) {
                        arr[0].summary = data.summary;
                        arr[0].holder = '';
                    }
                    if (isMaster === 0 && data.completeRemark && data.completeRemark.length) {
                        arr[1].completeRemark = data.completeRemark;
                        arr[1].holder = '';
                    }
                }

                me.render('#main', {
                    list: arr
                }, {
                    partials: {
                        attach: attachTpl,
                        alertBox: alertTpl
                    }
                });

                // 附件列表容器
                $attachList = $('#attachList');
                // 总结情景下，提供上传附件功能
                me.attach = null;

                // 等待模版渲染完毕
                if (data && data.summaryAttachs) {
                    me.attach = AttachWrapper.initAttach({
                        container: '#attachList',
                        addBtn: '#addAttach',
                        callback: function () {
                            if (me.attach.getModifyAttaches().length > 0) {
                                valid.isEdit = true;
                            }
                        }
                    }, data.summaryAttachs);
                }

                me.initInput();
            }
        });
    }
    // 渲染对应模板
    else if (myPage) {
        me.renderNewSubmit(myPage, isMaster);
    }
};

page.initInput = function () {

    var me = this;

    me.phoneInput = [];

    $('.phone-input').each(function (i) {
        var limits = 500;
        if (/summary|talkSummary/.test(me.pageType)) {
            limits = 5000;
        }
        me.phoneInput.push(
            new PhoneInput({
                handler: this,
                limit: limits
            })
        );
    });
};

/**
 * 渲染 新建提交
 *
 * @param {Object} myPage, 当前页面配置
 * @param {boolean} isMaster, 如果是 2个总结的页面，传递该值
 */
page.renderNewSubmit = function (myPage, isMaster) {
    this.render('#main', {
        list: myPage(isMaster)
    }, {
        partials: {
            alertBox: alertTpl
        }
    });

    this.initInput();
};

function validEdited(page) {
    if (!page || !page.phoneInput) {
        return;
    }
    page.phoneInput.forEach(function (item) {
        var f = item.isEdited();
        valid.isEdited = f ? f : valid.isEdited;
    });
}

function cancelValidate() {

    if (valid.isEdited) {
        MidUI.alert({
            content: lang.whetherGiveUpCurrContent,
            onApply: function () {
                navigation.open(-1);
            }
        });
        return;
    }

    navigation.open(-1);
}

page.getTagDetail = {
    summary: function (me, targetTag) {
        var $summary = $('[data-name=summary]');
        var $remark = $('[data-name=applyReason]');
        var $attachItem = $('.componentAttachItem');
        var isMaster = parseInt(util.params('master'), 2);
        if ($summary && $summary.length && $.trim($summary.text())) {
            targetTag.summary = true;
        }
        if ($remark && $remark.length && $.trim($remark.text())) {
            targetTag.applyReason = true;
        }
        if (me.attach) {
            targetTag.attaches = !!$attachItem.length;
        }
        if (isMaster) {
            targetTag.isMaster = !!isMaster;
        }
    },
    talkSummary: function (me, targetTag) {
        var $summary = $('[data-name=summary]');
        var $attachItem = $('.componentAttachItem');
        if ($summary && $summary.length && $.trim($summary.text())) {
            targetTag.talkSummary = true;
        }
        if (me.attach) {
            targetTag.attaches = !!$attachItem.length;
        }
    },
    // 撤销
    revoke: function (me, targetTag) {
        var $val = $('.phone-input-main');
        if ($val && $val.length && $.trim($val.text())) {
            targetTag.revokeReason = true;
        }
    },
    // 拒绝
    refuse: function (me, targetTag) {
        var $val = $('.phone-input-main');
        if ($val && $val.length && $.trim($val.text())) {
            targetTag.refuseReason = true;
        }
    },
    agree: function (me, targetTag) {
        var $val = $('.phone-input-main');
        if ($val && $val.length && $.trim($val.text())) {
            targetTag.aduitAgreeReason = true;
        }
    },
    notAgree: function (me, targetTag) {
        var $val = $('.phone-input-main');
        if ($val && $val.length && $.trim($val.text())) {
            targetTag.aduitNotAgreeReason = true;
        }
    }
};

/**
 * 设置按钮的状态
 *
 * @param {boolean} isCan, 是否能提交，设置状态
 */
function setCanSubmit(isCan) {
    if (typeof isCan !== 'boolean') {
        return;
    }
    clearTimeout(rightTimmer);

    // ios必须延迟250ms才能设置成功
    rightTimmer = setTimeout(function () {
        navigation.button('right', isCan);
    }, 250);
}

page.getTargetTag = function (errCode) {
    var me = this;
    var pageType = me.pageType;
    var targetTag = {};

    if (pageType === 'talkSummary') {
        targetTag.talkId = util.params('talkId');
    }
    else {
        targetTag.taskId = util.params('taskId');
    }
    me.getTagDetail[pageType](me, targetTag);
    if (errCode) {
        targetTag.err = errCode;
    }
    return targetTag;
};

page.deviceready = function () {
    var me = this;

    function goBack() {
        validEdited(me);
        cancelValidate();
    }

    function submit() {
        if (!isCanSubmit) {
            return;
        }
        if (me.attach && !me.attach.isAttachesReady()) {
            var $alertDom = $('#alert-length-limit');
            $alertDom.text(me.lang.attachNoReady).removeClass('hide');
            me.timer = setTimeout(function () {
                $alertDom.addClass('hide');
            },
            3000);
            return;
        }
        var dataArg = me.getData(me.pageType);

        // 总结和附件不能同时为空
        if (/summary|talkSummary/.test(me.pageType)) {
            var $attachLi = $attachList.find('.componentAttachItem');
            var length = $attachLi.length;
            if (!dataArg.data.summary && !length) {
                return;
            }
        }

        (me.pageType === 'talkSummary') && (dataArg.data.talkId = util.params('talkId'));
        var promise = me.post(dataArg.api, dataArg.data);
        isCanSubmit = false;
        setCanSubmit(isCanSubmit);
        var success = false;
        promise
            .done(function (result) {

                if (result && result.meta && result.meta.code === 200) {
                    success = true;
                    navigation.open(-1, {
                        goBackParams: 'refresh'
                    });
                }
            })
            .fail(function (result) {

            })
            .always(function (result) {
                if (!success) {
                    isCanSubmit = true;
                    setCanSubmit(isCanSubmit);
                }
                var errCode = (result && result.meta && result.meta.code !== 200) ? result.meta.code : '';
                var targetTag = {};
                if (actionsTag[me.pageType]) {
                    targetTag = me.getTargetTag(errCode);
                    me.log.store({actionTag: actionsTag[me.pageType], targetTag: targetTag});
                }
            });
    }

    navigation.left({
        click: goBack
    });

    navigation.right([
        {
            title: me.lang.submit,
            click: submit
        }
    ]);

    navigation.buttonAutoEnable();
};

page.start();
