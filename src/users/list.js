/**
 * @file list.js
 * @author deo
 *
 * 人员列表页
 */

require('./list.scss');

var util = require('../common/util');
var users = require('common/middleware/user/users.js');
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

    users.getUserAndPhoto(jids)
        .done(function (data) {
            me.data = {
                list: data
            };

            dfd.resolve();
        })
        .fail(function () {
            dfd.reject();
        });

    return dfd;
});

$(function () {
    page.start();
});
