/**
 * @file detail.js
 * @author deo
 *
 * 事件详情页
 */

require('./detail.scss');
require('dep/ui/virtualInput/virtualInput.scss');

var config = require('../config');
// var util = require('../common/util');
var detailUtil = require('../common/widgets/detail/detail.js');
// var phoneMid = require('../common/phoneMid.js');
var Page = require('../common/page');
var virtualInput = require('dep/ui/virtualInput/virtualInput');

var page = new Page();

page.enter = function () {

    this.render('#detail-main', this.data);

    virtualInput('.goalui-fixedinput');

    this.bindEvents();
};

page.bindEvents = function () {

    this.$more = $('#affair-talk-more-handler');
    this.$affairTalk = $('#affair-talk');

    var CLASSES = {
        UNTICK: 'untick',
        TICKED: 'ticked',
        CIRCLE_SQUARE: 'tick-circle-to-square',
        TICKED_ANIMATE: 'tick-ticked-animate',
        SQUARE_CIRCLE: 'tick-square-to-circle',
        UNTICK_ANIMATE: 'tick-untick-animate'
    };

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
 * 请求页面接口
 *
 * @param {deferred} dfd, deferred
 *
 */
page.addParallelTask(function (dfd) {
    var me = this;
    var promise = page.post(config.API.AFFAIR_DETAIL_URL);

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
