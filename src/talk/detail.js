/**
 * @file detail.js
 * @author deo
 *
 * 讨论详情页
 */

require('dep/plugins/attaches/css/attaches.css');

require('./detail.scss');
require('common/ui/virtualInput/virtualInput.scss');

var config = require('../config');
var util = require('../common/util');
var detailUtil = require('common/widgets/detail/detail.js');
var users = require('common/middleware/user/users.js');
var Page = require('common/page');
var virtualInput = require('common/ui/virtualInput/virtualInput');

var Ticker = require('common/ui/ticker/ticker');

var tmplTitle = require('common/widgets/detail/title');
var tmplDescribe = require('common/widgets/detail/describe');
var AttachWraper = require('common/middleware/attach/attachWraper');

var page = new Page();

page.enter = function () {
    var me = this;
    this.$main = $('.main');

    this.data.describeTitle = '讨论描述';
    this.render('#detail-main', this.data, {
        partials: {
            title: tmplTitle,
            describe: tmplDescribe
        }
    });

    virtualInput('.goalui-fixedinput');

    this.ticker = new Ticker('.tick', {
        async: true
    });

    this.bindEvents();

    /* eslint-disable */
    this.attach = AttachWraper.initDetailAttach({
        attachData: me.data.summary_attachs, 
        container: '.attach-container', 
        wrapper: '.attach'
    });
    /* eslint-enable */
};

page.bindEvents = function () {
    var me = this;

    this.$more = $('#affair-talk-more-handler');
    this.$affairTalk = $('#affair-talk');

    // 查看更多人员
    this.$main.on('click', '.partner-more', function () {
        var jids = $(this).data('jids');

        if (jids && jids.toString().length > 0) {
            /* eslint-disable */
            CPNavigationBar.redirect('/users/list.html?jids=' + jids);
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
    /* eslint-enable */

    this.ticker.on('click', function (isCurTicked) {
        var myTicker = this;
        // 0: 取消
        // 1: 完成
        var changeStatus = isCurTicked ? 0 : 1;

        /* eslint-disable */
        var promise = page.post(config.API.TASK_FOLLOW, {
            task_id: me.data.task_id,
            level: changeStatus
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

    this.render('#partner', dataRaw);
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

                var dfdPub = users.getUserInfo(data.user_ids);

                // 查询用户信息失败
                if (dfdPub === null) {
                    me.data.userInfoFail = true;
                }
                else {
                    dfdPub
                        .done(function (pubData) {
                            me.renderUser(pubData.contacts);
                        })
                        .fail(function () {
                        });
                }

                dfd.resolve(data);
            }

        });

    return dfd;
});

$(function () {
    page.start();
});
