/**
 * @file detail.js
 * @author deo
 *
 * 事件详情页
 */
require('dep/plugins/attaches/css/attaches.css');

require('./detail.scss');
require('common/ui/virtualInput/virtualInput.scss');

var config = require('../config');
var util = require('../common/util');
var detailUtil = require('common/widgets/detail/detail');
// var phoneMid = require('../common/phoneMid.js');
var Page = require('common/page');
var virtualInput = require('common/ui/virtualInput/virtualInput');

var Ticker = require('common/ui/ticker/ticker');

var tmplTitle = require('common/widgets/detail/title');
var tmplDescribe = require('common/widgets/detail/describe');
var AttachWrapper = require('common/middleware/attach/attachWrapper');

var widgetCommentList = require('common/widgets/comment/list');

var page = new Page({
    pageName: 'affair-detail'
});

page.enter = function () {
    var me = this;

    me.data.describeTitle = '事件描述';
    me.render('#detail-main', me.data, {
        partials: {
            title: tmplTitle,
            describe: tmplDescribe
        }
    });

    virtualInput('.goalui-fixedinput');

    me.ticker = new Ticker('.tick', {
        async: true
    });

    me.bindEvents();

    /* eslint-disable */
    me.attach = AttachWrapper.initDetailAttach({
        attachData: me.data.attachs, 
        container: '.attach-container', 
        wrapper: '.attach'
    });
    /* eslint-enable */

    me.initCommentList();
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

    this.ticker.on('click', function (isCurTicked) {
        var myTicker = this;
        // 0: 取消
        // 1: 完成
        var changeStatus = isCurTicked ? 0 : 1;

        /* eslint-disable */
        var promise = page.post(config.API.AFFAIR_DONE, {
            task_id: me.data.task_id,
            affair_id: me.data.id
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

page.initCommentList = function () {
    var me = this;

    /* eslint-disable */
    widgetCommentList.init({
        promise: function () {
            return me.get(config.API.AFFAIR_COMMENT_LIST, {
                affair_id: me.data.id,
                curr_page: 1,
                sort_type: 0,
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
        affair_id: util.params('id')
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
