/**
 * @file index.js
 * @author deo
 * 首页
 *
 */

require('./index.scss');

var config = require('../config');
var Page = require('common/page');

var page = new Page();

page.enter = function () {

    this.setMenuHeight();

    this.render('#menu', {
        list: this.data.list
    });

    this.bindEvents();
};

page.setMenuHeight = function () {

    var winHeight = $(window).height();
    var buttonHeight = $('.add-task').height();
    var menuHeight = winHeight - buttonHeight;

    $('#menu').height(menuHeight);
};

page.bindEvents = function () {
    var me = this;

    $('#menu li').on('click', function () {
        /* eslint-disable */
        CPNavigationBar.redirect('/task/list.html');
        /* eslint-enable */
    });

    $('#add-newtask').on('click', function () {
        /* eslint-disable */
        CPNavigationBar.redirect('/task/detail.html?cid=4');
        /* eslint-enable */
    });

    var evt = 'onorientationchange' in window ? 'orientationchange' : 'resize';
    window.addEventListener(evt, function () {
        me.setMenuHeight();
    }, false);
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
