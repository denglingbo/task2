/**
 * @file detail.js
 * @author deo
 *
 * 讨论详情页
 */

var pageName = 'talk-detail';

require('dep/ui/attaches/css/attaches.css');

require('./detail.scss');
require('common/ui/virtualInput/virtualInput.scss');

var config = require('../config');
var util = require('../common/util');
var detailUtil = require('common/widgets/detail/detail.js');
var users = require('common/middleware/user/users.js');
var Page = require('common/page');
var VirtualInput = require('common/ui/virtualInput/virtualInput');

var Ticker = require('common/ui/ticker/ticker');

require('common/widgets/emptyPage/netErr.scss');
// var tmplError = require('common/widgets/emptyPage/netErr');
var tmplTitle = require('common/widgets/detail/title');
var tmplDescribe = require('common/widgets/detail/describe');

var AttachWrapper = require('common/middleware/attach/attachWrapper');

var widgetCommentList = require('common/widgets/comment/list');

var localcache = require('common/localcache');
localcache.init(pageName, function () {
    return util.getParam('id');
});

var page = new Page({
    pageName: pageName
});

page.error = function () {
    // this.render('#detail-main', this.data, {
    //     partials: {
    //         title: tmplError
    //     }
    // });
};

page.enter = function () {
    var me = this;
    this.$main = $('.main');

    this.data.describeTitle = me.lang.talkDescribeTitle;

    this.render('#detail-main', this.data, {
        partials: {
            title: tmplTitle,
            describe: tmplDescribe
        }
    });
    me.render('#goalui-fixedinput', {lang: me.data.lang});
    this.virtualInput = new VirtualInput('.goalui-fixedinput');

    this.ticker = new Ticker('.tick', {
        async: true
    });

    this.bindEvents();

    if (me.isFailed) {
        return;
    }

    me.initCommentList();
};

/**
 * 等待 设备 && 数据
 */
page.allready = function () {
    var me = this;
    var data = me.data;

    me.attach = AttachWrapper.initDetailAttach({
        attachData: data.summary_attachs,
        container: '.attach-container',
        wrapper: '.attach'
    });

    var dfdPub = users.getUserInfo(data.user_ids);

    // 查询用户信息失败
    if (dfdPub === null) {
        return;
    }

    dfdPub
        .done(function (pubData) {
            me.renderUser(pubData.contacts);
        });
};

page.bindEvents = function () {
    /* eslint-disable */
    var me = this;
    /* eslint-enable */
    this.$more = $('#affair-talk-more-handler');
    this.$affairTalk = $('#affair-talk');

    // 查看更多人员
    this.$main.on('click', '.partner-more', function () {
        var jids = $(this).data('jids');

        if (jids && jids.toString().length > 0) {
            /* eslint-disable */
            CPNavigationBar.redirect('/users-list.html?jids=' + jids);
            /* eslint-enable */
        }
    });

    // 完成按钮点击事件
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
        // 1: 
        var changeStatus = isCurTicked ? 0 : 1;
        var api = changeStatus === 1 ? config.API.TALK_DONE : config.API.TALK_RESUME;

        /* eslint-disable */
        var promise = page.post(api, {
            task_id: me.data.task_id,
            talk_id: me.data.id
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
 * 渲染成员数据
 *
 * @param {Array} arr, 数据
 *
 */
page.renderUser = function (arr) {
    var dataRaw = {};

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

    this.render('#partner', $.extend({lang: this.lang}, dataRaw));
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
            delete: config.API.TALK_COMMENT_DELETE,
            add: config.API.TALK_COMMENT_ADD
        },

        // 获取列表
        promise: function () {
            return me.get(config.API.TALK_COMMENT_LIST, {
                talk_id: me.data.id,
                curr_page: this.page,
                sort_type: 0,
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

    /* eslint-disable */
    var promise = page.get(config.API.TALK_DETAIL_URL, {
        talk_id: util.params('id')
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

        })
        .fail(function () {
            dfd.reject();
        });

    return dfd;
});

$(function () {
    page.start();
});
