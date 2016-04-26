/**
 * @file list.js
 * @author deo
 *
 * 人员列表页
 */

// var config = require('../config');
var util = require('../common/util');
var mobile = require('../common/mobile.js');
var Page = require('../common/page');

var page = new Page();

page.enter = function () {
    // console.log(this.data);
};

/**
 * 这里虽然莫有请求页面接口，但是还是按常规请求来处理
 *
 * @param {deferred} dfd, deferred
 *
 */
page.addParallelTask(function (dfd) {
    var me = this;
    var jids = util.params('jids');

    var promise = mobile.getUserIcon(jids);

    promise
        .done(function (data) {
            me.data = data;
            dfd.resolve(data);
        })
        .fail(function () {
            dfd.reject();
        });

    return dfd;
});

$(function () {
    page.start();
});
