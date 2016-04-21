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

var params = util.getUrlParams();

page.enter = function () {
    // console.log(this.data);

    this.render('#detail-main', this.data);

    this.bindEvents();
};

page.bindEvents = function () {

    $('.column-right').on('click', function () {
        // console.log('chakanshi');
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
    var promise = page.post(config.API.DETAIL_URL, {
        page: params.page || 0
    });

    promise
        .done(function (result) {
            if (result.meta && result.meta.code !== 200) {
                dfd.reject(result);
            }
            else {
                var data = result.data;

                // 根据 page 参数
                if (params && params.page) {
                    var pageName = params.page;
                    data.page = {};
                    if (pageName === '0') {
                        data.pageTask = true;
                    }
                    else if (pageName === '1') {
                        data.pageEvent = true;
                    }
                    else if (pageName === '2') {
                        data.pageTalk = true;
                    }
                }

                data.updateDateRaw = util.formatDateToNow(data.update_time);

                var statusMap = {
                    1: '已完成',
                    2: '待审核',
                    3: '等待中'
                };
                data.statusText = (function () {
                    return statusMap[data.status] || '';
                })();

                data.hasFollow = (function () {
                    return data.status !== 1;
                })();

                me.data = data;

                dfd.resolve();
            }
        });
});

$(function () {
    page.start();
});
