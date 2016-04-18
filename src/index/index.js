/**
 * @file index.js
 * @author deo
 * 首页
 *
 */

require('./index.scss');

var config = require('../config');
var Page = require('../common/page');
var View = require('../common/view');

var page = new Page();
var view = new View();

page.enter = function () {

    view.render('#menu', {
        list: this.data.list
    });

    this.bindEvents();
};

page.bindEvents = function () {
    $('.menu li').on('click', function () {
        window.CPNavigationBar.redirect('task/list.html');
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
    var promise = page.post(config.API.HOME_URL, {});
    promise
        .done(function (result) {
            if (result.status !== 0) {
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

// CPNavigationBar.redirect('search-custom.html');

// $.ajax({
//     type: 'post',
//     url: 'http://172.16.1.169:8015/api?id=1000',
//     success: function (result) {
//         var data = result.data;

//         require.ensure(['tpl/list.tpl'], function (require) {
//             var tpl = require('tpl/list.tpl');
//             var html = tpl(data);
//             $('#list').html(html);
//         });
//     }
// });
