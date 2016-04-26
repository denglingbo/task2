/**
 * @file list.js
 * @author deo
 *
 * 人员列表页
 */

require('./list.scss');

// var config = require('../config');
var util = require('../common/util');
var mobile = require('../common/mobile.js');
var Page = require('../common/page');

var page = new Page();

page.enter = function () {
    this.render('#users-list', this.data);
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
            me.data = {
                list: data
            };

            dfd.resolve();
        })
        .fail(function () {
            dfd.reject();
        });


    // var promiseA = mobile.getUserAndPhoto(jids);

    return dfd;
});

$(function () {
    page.start();
});
