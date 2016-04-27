/**
 * @file detail.js
 * @author deo
 *
 * 讨论详情页
 */

require('./detail.scss');
require('dep/ui/virtualInput/virtualInput.scss');

var config = require('../config');
// var util = require('../common/util');
var detailUtil = require('../common/widgets/detail/detail.js');
var phoneMid = require('../common/phoneMid.js');
var Page = require('../common/page');
var virtualInput = require('dep/ui/virtualInput/virtualInput');

var page = new Page();

var CLASSES = {
    UNTICK: 'untick',
    TICKED: 'ticked',
    CIRCLE_SQUARE: 'tick-circle-to-square',
    TICKED_ANIMATE: 'tick-ticked-animate',
    SQUARE_CIRCLE: 'tick-square-to-circle',
    UNTICK_ANIMATE: 'tick-untick-animate'
};

page.enter = function () {
    this.$main = $('.main');

    this.render('#detail-main', this.data);

    virtualInput('.goalui-fixedinput');

    this.bindEvents();
};

page.bindEvents = function () {

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

    $('.tick').on('click', function () {

        var $elem = $(this);

        // 勾选
        if ($elem.hasClass(CLASSES.UNTICK)) {
            $elem
                .removeClass(CLASSES.UNTICK)
                .removeClass(CLASSES.TICKED)
                .removeClass(CLASSES.UNTICK_ANIMATE)
                .removeClass(CLASSES.SQUARE_CIRCLE)
                .addClass(CLASSES.CIRCLE_SQUARE)
                .addClass(CLASSES.TICKED_ANIMATE);
        }
        // 取消勾选
        else {
            $elem
                .addClass(CLASSES.UNTICK)
                .addClass(CLASSES.TICKED)
                .removeClass(CLASSES.CIRCLE_SQUARE)
                .removeClass(CLASSES.TICKED_ANIMATE)
                .addClass(CLASSES.UNTICK_ANIMATE)
                .addClass(CLASSES.SQUARE_CIRCLE);
        }
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
            partnerJids.push(phoneMid.takeJid(item.jid));
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
    var promise = page.post(config.API.TALK_DETAIL_URL);

    promise
        .done(function (result) {
            var data = detailUtil.dealPageData(result);

            if (data === null) {
                dfd.reject(data);
            }
            else {
                me.data = data;

                var dfdPub = phoneMid.getUserInfo(data.user_ids);

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
