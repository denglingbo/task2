/**
 * @file detail.js
 * @author deo
 * 讨论详情页
 *
 */

require('./detail.scss');
require('dep/ui/virtualInput/virtualInput.scss');

var config = require('../config');
var util = require('../common/util');
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

    $('.column-right').on('click', function () {
        // console.log('chakanshi');
    });

    var $checkbox = $('.detail-checkbox');
    $checkbox.on('click', function () {
        var $elem = $(this);
        var $untick = $elem.find('.untick');
        var $ticked = $elem.find('.ticked');

        // 勾选
        if ($ticked.hasClass('hide')) {
            $untick.addClass('hide');
            $ticked.removeClass('hide').addClass('animate');
        }
        // 取消勾选
        else {
            $ticked.addClass('hide');
            $untick.removeClass('hide').addClass('animate');
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
    var promise = page.post(config.API.DISCUSSION_DETAIL_URL);

    promise
        .done(function (result) {
            if (result.meta && result.meta.code !== 200) {
                dfd.reject(result);
            }
            else {
                var data = result.data;

                // 时间展示
                data.updateDateRaw = util.formatDateToNow(data.update_time);

                // 状态显示
                var statusMap = {
                    1: '已完成',
                    2: '待审核',
                    3: '等待中'
                };
                data.statusText = (function () {
                    return statusMap[data.status] || '';
                })();

                // 是否有 follow
                data.hasFollow = (function () {
                    return data.status !== 1;
                })();

                // START - partner
                var partner = data.partner;
                var partnerRaw = [];

                partner.forEach(function (item) {
                    if (item.name && item.pinyin) {
                        partnerRaw.push(item.name + '(' + item.pinyin + ')');
                    }
                });

                if (partnerRaw.length) {
                    data.partnerLength = partner.length;
                }

                data.partnerRaw = partnerRaw.join('、');
                // END - partner

                me.data = data;

                dfd.resolve();
            }
        });

    return dfd;
});

$(function () {
    page.start();
});
