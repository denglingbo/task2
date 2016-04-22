/**
 * @file detail.js
 * @author deo
 * 任务详情页
 *
 */

require('./detail.scss');

var config = require('../config');
var util = require('../common/util');
var Page = require('../common/page');

var page = new Page();

page.enter = function () {
    // console.log(this.data);

    this.render('#detail-main', this.data);

    this.affairTalkRequest(false);

    this.bindEvents();
};

page.bindEvents = function () {
    var me = this;

    this.$more = $('#affair-talk-more-handler');
    this.$affairTalk = $('#affair-talk');

    $('.column-right').on('click', function () {
        // console.log('chakanshi');
    });

    // 加载更多事件和讨论
    this.$more.on('click', function () {
        me.affairTalkRequest();
    });
};


var loaderTimer = null;

/**
 * 加载条状态
 *
 * @param {string} status 要展示的状态
 * @param {number} delay 延迟执行时间
 */
function loaderStatus(status, delay) {

    var $elem = $('.load-more');

    var obj = {
        holder: $elem.find('.load-more-holder'),
        process: $elem.find('.load-more-process'),
        done: $elem.find('.load-more-done')
    };

    var $cur = obj[status] || null;

    if (!$cur || !$cur.length) {
        return;
    }

    if (delay === undefined) {
        $cur.removeClass('hide');
        $cur.siblings().addClass('hide');
    }
    else {
        clearTimeout(loaderTimer);
        loaderTimer = setTimeout(function () {
            $cur.removeClass('hide');
            $cur.siblings().addClass('hide');
        }, delay);
    }
}

/**
 * 发送加载列表请求
 *
 * @param {boolean} isStatus 是否需要加载条
 *
 */
page.affairTalkRequest = function (isStatus) {
    var me = this;
    var promise = page.post(config.API.TASK_DETAIL_EVENT_TALK_MORE_URL);
    var $loader = $('.load-more');

    // 每次请求后端会返回的 list 长度，默认为 10条，如果返回的 list.length 小于这个值，就认为没有新数据了
    var pageNum = 10;

    var hasStatus = true;
    if (isStatus === false) {
        hasStatus = false;
    }

    if (hasStatus) {
        loaderStatus('process');
    }

    promise
        .done(function (result) {
            if (result.meta && result.meta.code !== 200) {

            }
            else {
                var data = result.data;

                if (!data.list) {
                    return;
                }

                me.renderAffairTalk(result.data);

                if (data.list.length < pageNum) {
                    $loader.addClass('hide');
                }
                else {
                    $loader.removeClass('hide');
                }

                if (hasStatus) {
                    loaderStatus('done');
                    loaderStatus('holder', 500);
                }
            }
        });
};

page.renderAffairTalk = function (data) {
    this.render('#affair-talk', data, 'append');
};

/**
 * 请求页面接口
 *
 * @param {deferred} dfd, deferred
 *
 */
page.addParallelTask(function (dfd) {
    var me = this;
    var promise = page.post(config.API.TASK_DETAIL_URL);

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
