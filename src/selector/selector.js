/**
 * @file selector.js
 * @author hefeng
 * 选人组件页
 *
 */

var Page = require('../common/page');
var config = require('../config');
var page = new Page();

page.enter = function () {

};

page.bindEvents = function () {

};

page.addParallelTask(function (dfd) {
    var me = this;
    var promise = page.post(config.API.DISCUSSION_EDIT_URL, {});

    promise
        .done(function (result) {
            if (result.meta !== 0) {
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
