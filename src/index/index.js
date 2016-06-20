/**
 * @file index.js
 * @author deo
 * 首页
 *
 */

require('./index.scss');

var Page = require('common/page');
var page = new Page();

var config = require('../config');
var Pharos = require('common/ui/pharos');
var navigation = require('common/middleware/navigation');

require('common/ui/touchButton')();

page.enter = function () {

    this.render('#main', {
        lang: this.lang
    });

    this.setSize();

    this.bindEvents();

    this.initHomeNum();
};

page.deviceready = function () {

    var lang = this.lang;
    navigation.title(lang.task);
};

page.setSize = function () {

    var winHeight = $(window).height();

    var topHeight = winHeight * .68;

    var $menu = $('#menu');
    var $bottomWrapper = $('#bottom-wrapper');
    var $buttonWrapper = $('.button-layout');

    $menu.height(topHeight);
    $bottomWrapper.height(winHeight - topHeight);

    // 获取底部 按钮区域总高度
    var buttonWrapperHeight = $('.add-task').height();
    var buttonSize = buttonWrapperHeight - $('.button-text').height();

    $('.button-img').css({
        width: buttonSize,
        height: buttonSize
    });

    $buttonWrapper .css({
        'margin-left': $buttonWrapper .width() * -.5
    });
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

        if (rid !== undefined) {
            navigation.open('/task-list.html?rid=' + rid, {
                title: ridMap[rid],
                returnParams: function (prevData) {
                    if (prevData && prevData === 'refresh') {
                        me.refresh();
                    }
                }
            });
        }
    });

    $('#add-newtask').on('click', function () {
        navigation.open('/task-new.html', {
            title: me.lang.newTask,
            transitionParam: {
                transFlag: 1
            },
            returnParams: function (prevData) {
                if (prevData && prevData === 'refresh') {
                    me.refresh();
                }
            }
        });
    });

    var evt = 'onorientationchange' in window ? 'orientationchange' : 'resize';
    window.addEventListener(evt, function () {
        me.setMenuHeight();
    }, false);
};

/**
 * 设置首页计数器
 */
page.initHomeNum = function () {

    var promise = this.get(config.API.HOME_URL);

    promise
        .done(function (result) {
            if (result && result.meta.code === 200) {
                new Pharos('#menu', result.data);
            }
        });
};

page.start();
