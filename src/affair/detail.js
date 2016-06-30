/**
 * @file detail.js
 * @author deo
 *
 * 事件详情页
 */
require('dep/ui/attaches/css/attaches.css');

require('./detail.scss');
require('common/ui/virtualInput/virtualInput.scss');

var config = require('../config');
var util = require('../common/util');
var detailUtil = require('common/widgets/detail/detail');
var VirtualInput = require('common/ui/virtualInput/virtualInput');

var Ticker = require('common/ui/ticker/ticker');

var tmplTitle = require('common/widgets/detail/title');
var tmplDescribe = require('common/widgets/detail/describe');
var AttachWrapper = require('common/middleware/attach/attachWrapper');

var WidgetCommentList = require('common/widgets/comment/list');
var navigation = require('common/middleware/navigation');

var Page = require('common/page');
var page = new Page();

page.enter = function () {
    var me = this;

    me.data.describeTitleRaw = me.lang.affairDescribeTitle;

    me.render('#detail-main', me.data, {
        partials: {
            title: tmplTitle,
            describe: tmplDescribe
        }
    });

    detailUtil.richContent();

    // 是否有评论权限
    if (me.data.rights && me.data.rights.commentRight) {
        me.render('#comment-input-wrapper', {lang: me.data.lang});
    }

    this.virtualInput = new VirtualInput('.goalui-fixedinput');

    me.ticker = new Ticker('.tick', {
        async: true
    });

    me.bindEvents();

    // 根据权限渲染之后修正样式
    detailUtil.fixStyles();
};

/**
 * 等待 设备 && 数据
 */
page.deviceready = function () {
    var me = this;
    var data = me.data;

    me.initCommentList();

    if (data.attachs && data.attachs.length) {
        AttachWrapper.initDetailAttach({
            attachData: data.attachs,
            container: '.attach-container',
            wrapper: '.attach'
        });
    }

    me.setNavigation();
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

    detailUtil.naviRight(me, me.data, 'affair');
};

page.bindEvents = function () {
    var me = this;
    var $comment = $('#comment-input-wrapper');
    var affairId = util.params('id');
    // 绑定 tick 点击事件
    detailUtil.bindTickEvents.call(this, {
        pageKey: 'affairId',
        ticked: config.API.AFFAIR_DONE,
        untick: config.API.AFFAIR_RESUME,

        // 完成状态
        tickedCallback: function () {
            me.log.store({
                actionTag: 'affairTick',
                targetTag: {
                    affairId: affairId,
                    type: 'done'
                }
            });
            navigation.button('right', false);
            $comment && $comment.addClass('hide');
        },

        // 恢复状态
        untickCallback: function (data) {
            me.log.store({
                actionTag: 'affairTick',
                targetTag: {
                    affairId: affairId,
                    type: 'recover'
                }
            });
            navigation.button('right', true);
            detailUtil.naviRight(me, data, 'affair');
            $comment && $comment.removeClass('hide');
        }
    });
};

/**
 * 调用 widgets/comment/list 初始化评论列表相关代码
 */
page.initCommentList = function () {
    var me = this;

    /* eslint-disable */
    new WidgetCommentList(me, {
        name: 'affair',
        data: me.data,
        moreNullHidden: true,

        API: {
            delete: config.API.AFFAIR_COMMENT_DELETE,
            add: config.API.AFFAIR_COMMENT_ADD
        },

        // 获取列表
        promise: function () {
            return me.get(config.API.AFFAIR_COMMENT_LIST, {
                affairId: me.data.id,
                currPage: this.page,
                sortType: 0,
                number: 10
            });
        }
    });
    /* eslint-enable */
};

/**
 * 请求页面接口
 *
 * @param {deferred} dfd, deferred
 *
 */
page.addParallelTask(function (dfd) {
    var me = this;

    var promise = page.get(config.API.AFFAIR_DETAIL_URL, {
        affairId: util.params('id')
    });

    promise
        .done(function (result) {
            if (result.meta && result.meta.code !== 200) {
                dfd.reject(result);
            }
            else {
                result.data.pageType = 'affair';
                me.data = detailUtil.dealPageData(result.data);
                dfd.resolve(me.data);
            }
        });

    return dfd;
});

page.start();
