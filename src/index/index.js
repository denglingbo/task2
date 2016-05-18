/**
 * @file index.js
 * @author deo
 * 首页
 *
 */

require('./index.scss');

var config = require('../config');
var Page = require('common/page');
var Pharos = require('common/ui/pharos');

var page = new Page({
    pageName: 'index-index'
});

page.enter = function () {

    this.render('#main', {
        lang: this.lang
    });

    this.initHomeNum();

    this.setMenuHeight();

    this.bindEvents();
};

page.initHomeNum = function () {

    var promise = this.get(config.API.HOME_URL);

    promise
        .done(function (result) {

            if (result && result.meta.code === 200) {
                new Pharos('#menu', result.data);
            }
        });
};

page.setMenuHeight = function () {

    var winHeight = $(window).height();

    var topHeight = winHeight * .7;
    var bottomHeight = winHeight - topHeight;

    $('.add-task').height(bottomHeight);

    $('#menu').height(topHeight);
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
        CPNavigationBar.redirect('/task/new.html');
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
// page.addParallelTask(function (dfd) {
//     var me = this;
// /* eslint-disable */
// // test 后端暂无首页接口
// dfd.resolve();
// return;

//     var promise = page.get(config.API.HOME_URL, {});
//     promise
//         .done(function (result) {
//             if (result.meta && result.meta.code !== 200) {
//                 dfd.reject(result);
//             }
//             else {
//                 me.data = result.data;
//                 dfd.resolve();
//             }
//         });
// });


$(function () {
    page.start();
});
