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
var navigation = require('common/middleware/navigation');

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

    navigation.title(lang.task);

    navigation.left({
        click: function () {
            navigation.open(-1);
        }
    });
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

    var ridMap = {
        2: me.lang.director,
        1: me.lang.dispatch,
        3: me.lang.partake
    };

    $('#menu li').on('click', function (event) {

        var rid = $(this).data('rid');

        if (rid) {
            navigation.open('/task-list.html?rid=' + rid, {
                title: ridMap[rid]
            });
        }
    });

    $('#add-newtask').on('click', function () {
        navigation.open('/task-new.html', {
            referer: '/task-list.html?rid=1',
            title: me.lang.newTask
        });
    });

    var evt = 'onorientationchange' in window ? 'orientationchange' : 'resize';
    window.addEventListener(evt, function () {
        me.setMenuHeight();
    }, false);
};

$(window).on('load', function () {
    page.start();
});
