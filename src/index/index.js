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

var page = new Page();

page.enter = function () {

    this.render('#main', {
        lang: this.lang
    });

    this.initHomeNum();

    this.setMenuHeight();

    this.bindEvents();
};

page.deviceready = function () {

    var lang = this.lang;
    /* eslint-disable */
    CPNavigationBar.setLeftButton({
        title: lang.back,
        iconPath: '',
        callback: function () {
            CPNavigationBar.returnPreviousPage();
        }
    });
    /* eslint-enable */
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

    var topHeight = winHeight * .68;
    var bottomHeight = winHeight - topHeight;

    $('.add-task').height(bottomHeight);

    $('#menu').height(topHeight);
};

page.bindEvents = function () {
    var me = this;

    $('#menu li').on('click', function (event) {
        /* eslint-disable */
        CPNavigationBar.redirect('/task-list.html');
        /* eslint-enable */
    });

    $('#add-newtask').on('click', function () {
        /* eslint-disable */
        CPNavigationBar.redirect('/task-new.html');
        /* eslint-enable */
    });

    var evt = 'onorientationchange' in window ? 'orientationchange' : 'resize';
    window.addEventListener(evt, function () {
        me.setMenuHeight();
    }, false);
};

$(function () {
    page.start();
});
