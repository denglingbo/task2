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
    if (me.data.rights.commentRight) {
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
    var lang = me.lang;
    var data = me.data;

    me.attach = AttachWrapper.initDetailAttach({
        attachData: data.summaryAttachs,
        container: '.attach-container',
        wrapper: '.attach'
    });

    me.attach = AttachWrapper.initDetailAttach({
        attachData: data.attachs,
        container: '.attach-container',
        wrapper: '.attach'
    });

    navigation.left({
        click: function () {
            navigation.open(-1, {
                goBackParams: 'refesh'
            });
        }
    });

    detailUtil.naviRight(me, me.data, 'affair');

    me.initCommentList();
};

page.bindEvents = function () {
    var me = this;

    // 绑定 tick 点击事件
    detailUtil.bindTickEvents.call(this, {
        pageKey: 'affairId',
        ticked: config.API.AFFAIR_DONE,
        untick: config.API.AFFAIR_RESUME,

        // 完成状态
        tickedCallback: function () {
            navigation.button('right', false);
        },

        // 恢复状态
        untickCallback: function (data) {
            navigation.button('right', true);
            detailUtil.naviRight(me, data, 'affair');
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
                me.data = detailUtil.dealPageData(result.data);
                dfd.resolve(me.data);
            }
        });

    return dfd;
});

page.start();
