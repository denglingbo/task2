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

var widgetCommentList = require('common/widgets/comment/list');

var Page = require('common/page');

var page = new Page();

page.enter = function () {
    var me = this;

    me.data.describeTitle = me.lang.affairDescribeTitle;
    me.render('#detail-main', me.data, {
        partials: {
            title: tmplTitle,
            describe: tmplDescribe
        }
    });

    me.render('#goalui-fixedinput', {lang: me.data.lang});

    this.virtualInput = new VirtualInput('.goalui-fixedinput');

    me.ticker = new Ticker('.tick', {
        async: true
    });

    me.bindEvents();

    me.initCommentList();
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

    /* eslint-disable */
    CPNavigationBar.setRightButton('xxx', [{
        title: '...',
        iconPath: '',
        callback: function() {
            
        }
    }]);
    CPNavigationBar.setLeftButton({
        title : lang.back,
        iconPath : '',
        callback : function () {
            CPNavigationBar.returnPreviousPage();
        }
    });
    /* eslint-enable */
};

page.bindEvents = function () {
    var me = this;

    this.$more = $('#affair-talk-more-handler');
    this.$affairTalk = $('#affair-talk');

    /* eslint-disable */
    var map = {
        '0': {
            done: 'untick',
            fail: 'ticked'
        },
        '1': {
            done: 'ticked',
            fail: 'untick'
        }
    };

    this.ticker.on('tick', function (isCurTicked) {
        var myTicker = this;
        // 0: 取消
        // 1: 完成
        var changeStatus = isCurTicked ? 0 : 1;
        var api = changeStatus === 1 ? config.API.AFFAIR_DONE : config.API.AFFAIR_RESUME;

        /* eslint-disable */
        var promise = page.post(api, {
            taskId: me.data.taskId,
            affairId: me.data.id
        });
        /* eslint-enable */

        var type = map[changeStatus];

        promise
            .done(function (result) {
                if (result && result.meta.code === 200) {
                    myTicker[type.done]();
                }
                else {
                    myTicker[type.fail]();
                }
            })
            .fail(function () {
                myTicker[type.fail]();
            });
    });
    /* eslint-enable */
};

/**
 * 调用 widgets/comment/list 初始化评论列表相关代码
 */
page.initCommentList = function () {
    var me = this;

    /* eslint-disable */
    new widgetCommentList(me, {

        data: me.data,

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
                number: 5
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

    /* eslint-disable */
    var promise = page.get(config.API.AFFAIR_DETAIL_URL, {
        affairId: util.params('id')
    });
    /* eslint-enable */

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

        });

    return dfd;
});

$(function () {
    page.start();
});
