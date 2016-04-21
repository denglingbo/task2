/**
 * @file detail.js
 * @author deo
 * 任务详情页
 *
 */

require('./detail.scss');

var config = require('../config');
var Page = require('../common/page');
var page = new Page();

page.enter = function () {
    // console.log(this.data);
    this.bindEvents();
}

page.bindEvents = function () {
    
    $('.column-right').on('click', function () {
        console.log('chakanshi');
    });
}

/**
 * 请求页面接口
 *
 * @param {deferred} dfd, deferred
 *
 */
page.addParallelTask(function (dfd) {
    var me = this;
    var promise = page.post(config.API.DETAIL_URL, {
        page: 0
    });

    promise
        .done(function (result) {
            if (result.meta && result.meta.code !== 200) {
                dfd.reject(result);
            }
            else {
                me.data = result.data;
                dfd.resolve();
            }
        });
});

$(function () {
    page.start();
});
