/**
 * @file detail.js
 * @author deo
 *
 * 讨论详情页
 */

require('dep/ui/attaches/css/attaches.css');

require('./detail.scss');
require('common/ui/virtualInput/virtualInput.scss');

var config = require('../config');
var Page = require('common/page');
var page = new Page();

var util = require('../common/util');
var detailUtil = require('common/widgets/detail/detail');
var users = require('common/middleware/users/users');
var VirtualInput = require('common/ui/virtualInput/virtualInput');

var Ticker = require('common/ui/ticker/ticker');

require('common/widgets/emptyPage/netErr.scss');
// var tmplError = require('common/widgets/emptyPage/netErr');
var tmplTitle = require('common/widgets/detail/title');
var tmplDescribe = require('common/widgets/detail/describe');

var AttachWrapper = require('common/middleware/attach/attachWrapper');

var WidgetCommentList = require('common/widgets/comment/list');
var navigation = require('common/middleware/navigation');

page.enter = function () {

    var me = this;

    me.$main = $('.main');

    me.data.describeTitleRaw = me.lang.talkDescribeTitle;
    me.data.summaryTitleRaw = me.lang.talkSummaryTitle;

    me.render('#detail-main', me.data, {
        partials: {
            title: tmplTitle,
            describe: tmplDescribe
        }
    });

    detailUtil.richContent();

    // 是否有评论权限
    if (me.data.rights.commentRight) {
        me.render('#comment-input-wrapper', {lang: me.data.lang});
        me.virtualInput = new VirtualInput('.goalui-fixedinput');
    }

    me.ticker = new Ticker('.tick', {
        async: true
    });

    me.bindEvents();

    me.initCommentList();

    // if (me.isFailed) {
    //     return;
    // }
};

/**
 * 等待 设备 && 数据
 */
page.deviceready = function () {
    var me = this;
    var lang = me.lang;
    var data = me.data;
    if (data.attachs && data.attachs.length) {
        me.attach = AttachWrapper.initDetailAttach({
            attachData: data.attachs,
            container: '.attach-container',
            wrapper: '.attach'
        });
    }

    var dfdPub = users.getUserInfo(data.userIds);

    dfdPub
        .done(function (pubData) {
            me.renderUser(pubData && pubData.contacts);
        })
        .fail(function () {
            me.renderUser(null);
        });


    navigation.left({
        title: lang.back,
        click: function () {
            navigation.open(-1);
        }
    });

    // 如果任务已经结束，不再有以下操作
    if (me.data.taskDoing() === false) {
        return;
    }

    var rightBar = [];
    var rights = me.data.rights;

    // 编辑权限
    if (rights.editRight) {
        rightBar.push({
            title: me.lang.editButton,
            click: function () {
                navigation.open('/talk-new.html?talkId=' + me.data.id, {
                    title: me.lang.editTalk
                });
            }
        });
    }

    if (rightBar.length >= 1) {
        navigation.right(rightBar);
    }
};

page.bindEvents = function () {
    // 查看更多人员
    this.$main.on('click', '.partner-more', function () {
        var jids = $(this).data('jids');

        if (jids && jids.toString().length > 0) {
            navigation.open('/users-list.html?jids=' + jids);
        }
    });

    // 绑定 tick 点击事件
    detailUtil.bindTickEvents.call(this, {
        pageKey: 'talkId',
        ticked: config.API.TALK_DONE,
        untick: config.API.TALK_RESUME
    });
};

/**
 * 渲染成员数据
 *
 * @param {Array} arr, 数据
 *
 */
page.renderUser = function (arr) {
    var dataRaw = {
        partnerLength: 0
    };

    if (arr) {
        var partnerRaw = [];
        var partnerJids = [];
        arr.forEach(function (item) {
            partnerRaw.push(item.name);
            partnerJids.push(users.takeJid(item.jid));
        });

        if (partnerRaw.length) {
            dataRaw.partnerLength = partnerRaw.length;
        }

        dataRaw.partnerRaw = partnerRaw.join('、');
        dataRaw.partnerJids = partnerJids.join(',');
    }
    else {

    }

    this.render('#partner', $.extend({lang: this.lang}, dataRaw));
};

/**
 * 调用 widgets/comment/list 初始化评论列表相关代码
 */
page.initCommentList = function () {
    var me = this;

    new WidgetCommentList(me, {

        data: me.data,
        moreNullHidden: true,

        API: {
            'delete': config.API.TALK_COMMENT_DELETE,
            'add': config.API.TALK_COMMENT_ADD
        },

        // 获取列表
        promise: function () {
            return me.get(config.API.TALK_COMMENT_LIST, {
                talkId: me.data.id,
                currPage: this.page,
                sortType: 0,
                number: 10
            });
        }
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

    var promise = page.get(config.API.TALK_DETAIL_URL, {
        talkId: util.params('id')
    });

    promise
        .done(function (result) {
            var data = detailUtil.dealPageData(result);

            if (data === null) {
                dfd.reject(data);
            }
            else {
                me.data = data;

                dfd.resolve(data);
            }

        })
        .fail(function () {
            dfd.reject();
        });

    return dfd;
});

page.start();
