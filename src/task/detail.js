/**
 * @file detail.js
 * @author deo
 * 任务详情页
 *
 */

require('./detail.scss');

var config = require('../config');
// var util = require('../common/util');
var detailUtil = require('../common/widgets/detail/detail.js');
var mobile = require('../common/mobile.js');
var Page = require('../common/page');

var page = new Page();

page.enter = function () {
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
    var promise = page.post(config.API.AFFAIR_TALK_MORE_URL);
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

    promise.done(function (result) {
        if (result.meta && result.meta.code !== 200) {

            return;
        }

        var data = result.data;

        if (!data.list) {
            return;
        }

        me.render('#affair-talk', data, 'append');

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
    });
};

/**
 * 查找某子对象是否属于源数据对象，同时把对应的数据附加到 appendObject 上
 *
 * @param {Object} srcObject, 源数据对象
 * @param {Object} itemObject, 子对象
 * @param {Object} appendObject, 匹配到某对象上
 *
 */
page.findOwner = function (srcObject, itemObject, appendObject) {
    var id = parseInt(mobile.takeJid(itemObject.jid), 10);

    for (var key in srcObject) {
        if (srcObject.hasOwnProperty(key)) {

            var objIds = srcObject[key];

            if ($.isArray(objIds) && $.inArray(id, objIds) !== -1) {

                var appender = appendObject[key];
                if (!$.isArray(appender)) {
                    appendObject[key] = [];
                }

                appendObject[key].push(itemObject);
            }
            // 非数组直接判断是否相等
            else if (objIds === id) {
                appendObject[key] = itemObject;
            }

        }
    }
};

/**
 * 成员获取失败
 *
 */
page.failUser = function () {
    $('#partner')
        .removeClass('hide')
        .html('<div class="sub-title">数据加载失败, 刷新重试</div>');
};

/**
 * 渲染成员数据
 *
 * @param {Array} originArr, 原始数组数据 jids，未merge 过的数组
 * @param {Array} dataArr, 匹配到的数据
 *
 */
page.renderUser = function (originArr, dataArr) {
    var me = this;

    var data = {
        creator: null,
        principal: null,
        partner: null
    };

    dataArr.forEach(function (item) {
        me.findOwner(originArr, item, data);
    });

    var dataRaw = {};

    if (data.creator) {
        dataRaw.creator = data.creator.name;
    }

    if (data.principal) {
        dataRaw.principal = data.principal.name;
    }

    if (data.partner) {
        var partnerRaw = [];
        data.partner.forEach(function (item) {
            // var pinyin = item.pinyin ? '(' + item.pinyin + ')' : '';
            partnerRaw.push(item.name);
        });

        if (partnerRaw.length) {
            dataRaw.partnerLength = partnerRaw.length;
        }

        dataRaw.partnerRaw = partnerRaw.join('、');
    }

    this.render('#partner', dataRaw);
    $('#partner').removeClass('hide');
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
            var data = detailUtil.dealPageData(result);

            if (data === null) {
                dfd.reject(data);
            }
            else {
                me.data = data;

                var obj = {
                    creator: data.create_user,
                    principal: data.principal_user,
                    partner: data.attend_ids
                };

                var dfdPub = mobile.getPubData(obj);

                dfdPub
                    .done(function (pubData) {
                        me.renderUser(obj, pubData);
                    })
                    .fail(function () {
                        me.failUser();
                    });

                dfd.resolve(data);
            }

        })
        .fail(function (a) {
            // console.log(a);
        });

    return dfd;
});

$(function () {
    page.start();
});
