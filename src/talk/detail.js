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
// var IScroll = require('dep/iscroll');

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

    var $comment = $('#comment-input-wrapper');
    var $main = $('.main');
    me.render($comment, {lang: me.data.lang});

    me.virtualInput = new VirtualInput('.goalui-fixedinput');

    // 无评论权限
    // 1. 无权限，2. 无评论权限，3. 所属的任务已经不是进行中，4. 当前讨论或事件不是进行中
    if (!me.data.rights || !me.data.rights.commentRight || !me.data.taskDoing() || !me.data.isDoing()) {
        $comment.addClass('hide');
        $main.addClass('nofixbar');
    }
    else {
        $comment.removeClass('hide');
        $main.removeClass('nofixbar');
    }

    me.ticker = new Ticker('.tick', {
        async: true
    });

    me.bindEvents();

    // 根据权限渲染之后修正样式
    detailUtil.fixStyles();

    // $('.main').height($(window).height() - $('#goalui-fixedinput').height());
    // setTimeout(function () {
    //     new IScroll('.main', {
    //         scrollX: false,
    //         scrollY: true,
    //         scrollbars: false,
    //         click: true,

    //         // 禁用监听鼠标和指针
    //         disableMouse: true,
    //         disablePointer: true,

    //         mouseWheel: false,

    //         // 快速触屏的势能缓冲开关
    //         momentum: false
    //     });
    // }, 1000);
};

/**
 * 等待 设备 && 数据
 */
page.deviceready = function () {
    var me = this;
    // var lang = me.lang;
    var data = me.data;

    // 加载附件
    me.setAttach('attachs');

    // 加载总结附件
    me.setAttach('summaryAttachs');

    var dfdPub = users.getUserInfo(data.userIds);

    dfdPub
        .done(function (pubData) {
            me.renderUser(pubData && pubData.contacts);
        })
        .fail(function () {
            me.renderUser(null);
        });

    // 讨论 & 事件 创建人显示在 创建时间之前
    users.getUserInfo([data.createUser])
        .done(function (pubData) {
            if (pubData && pubData.contacts) {
                var info = pubData.contacts[0];

                var timeText = (data.createTime === data.opTime) ? me.lang.createOn : me.lang.updateOn;

                if (info && info.name) {
                    $('.create-user').html(
                        '<em>' + info.name + '</em>'
                        + '<em>' + timeText + '</em>'
                    );
                }
            }
        });

    me.setNavigation();

    me.initCommentList();
};

// 获取init附件数据
var getAttachData = {
    attachs: function (data) {
        return {
            length: data.attachs.length,
            data: {
                attachData: data.attachs.length > 5 ? data.attachs.splice(0, 5) : data.attachs,
                container: '.attach-container',
                wrapper: '.attach'
            }
        };
    },
    summaryAttachs: function (data) {
        return {
            length: data.summaryAttachs.length,
            data: {
                attachData: data.summaryAttachs.length > 5 ? data.summaryAttachs.splice(0, 5) : data.summaryAttachs,
                container: '.summary-attach-container',
                wrapper: '.summary-attach'
            }
        };
    }
};

/**
 * 设置附件
 *
 * @param {string} type, 附件类型, 也是附件在数据中的key
 */
page.setAttach = function (type) {
    var me = this;
    var data = me.data;
    if (!type || !data || !data[type] || !data[type].length) {
        return;
    }
    var initData = getAttachData[type](data);
    AttachWrapper.initDetailAttach(initData.data);
    if (initData.length > 5) {
        $(initData.data.wrapper + ' .load-more').removeClass('hide');
    }
};

/**
 * 设置框外按钮
 */
page.setNavigation = function () {
    var me = this;

    navigation.left({
        click: function () {
            navigation.open(-1, {
                goBackParams: 'refresh:event-talk-list'
            });
        }
    });

    detailUtil.naviRight(me, me.data, 'talk');
};

page.bindEvents = function () {
    var me = this;
    var $comment = $('#comment-input-wrapper');
    var $htmlMain = $('.main');
    var talkId = util.params('id');

    // 查看更多人员
    this.$main.off('click');
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
        untick: config.API.TALK_RESUME,

        // 完成状态
        tickedCallback: function (data) {
            me.log.store({actionTag: 'talkDone', targetTag: {talkId: talkId}});
            // 暂时只做右侧禁用处理，先不判断权限
            // detailUtil.naviRight(me, data, 'talk');
            navigation.button('right', false);
            $comment && $comment.addClass('hide');
            $htmlMain.addClass('nofixbar');
        },

        // 恢复状态
        untickCallback: function (data) {
            me.log.store({actionTag: 'talkRecover', targetTag: {talkId: talkId}});
            navigation.button('right', true);
            data.id = talkId;
            detailUtil.naviRight(me, data, 'talk');
            $comment && $comment.removeClass('hide');
            $htmlMain.removeClass('nofixbar');
        }
    });

    // bind 附件加载更多
    $('.attach, .summary-attach').off('click');
    $('.attach, .summary-attach').on('click', '.load-more', function () {
        var type = $(this).attr('data-type');
        navigation.open('/attach-attach.html?talkId=' + talkId + '&page=talk&type=' + type, {
            title: me.lang.attach
        });
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
        name: 'talk',
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
            if (result.meta && result.meta.code !== 200) {
                dfd.reject(result);
            }
            else {
                result.data.pageType = 'talk';
                me.data = detailUtil.dealPageData(result.data);
                dfd.resolve(me.data);
            }
        })
        .fail(function () {
            dfd.reject();
        });

    return dfd;
});

page.start();
