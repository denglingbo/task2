/**
 * @file list.js
 * @author deo
 * 任务列表页
 *
 */

require('./list.scss');
require('common/widgets/search/searchEnter.scss');

var config = require('../config');
var util = require('common/util');
var Page = require('common/page');
// var Sticky = require('common/ui/sticky');

// 初始化 单页
var InitPage = require('./list/initPage');

// 初始化多页切换
var PageSlider = require('./list/pageSlider');

// var Search = require('common/widgets/search/searchEnter');

var IScroll = require('dep/iscroll');

// role id, 1: 我派发的，2: 我负责的，3:我参与的
var rid = util.getParam('rid');

var page = new Page();

var pages = [
    {
        name: 'doing',
        selector: '#list-wrapper-doing',
        index: 0,
        api: config.API.GET_TASK_LIST,
        current: true
    },
    {
        name: 'done',
        selector: '#list-wrapper-done',
        api: config.API.GET_TASK_LIST,
        index: 1
    },
    {
        name: 'cancel',
        selector: '#list-wrapper-cancel',
        api: config.API.GET_TASK_LIST,
        index: 2
    }
];

// 所有 tab 页面的对象
var pageCache = {};

page.enter = function () {
    // var me = this;

    this.initPage();

    // 设置滚动的元素的高宽
    $('.slider-container').css({
        width: $(window).width(),
        height: $(window).height()
    });

    // new Sticky({target: '#search', top: 0});

    // 3个底部切换内容的 page 页
    // this.initPage();

    // 初始化顶部的 tab
    this.initTab();

    this.bindEvents();

    // new Search(this, {
    //     selector: '#search',
    //     page: 'task'
    // });
};

page.deviceready = function () {
    var me = this;
    var lang = me.lang;

    /* eslint-disable */
    CPNavigationBar.setRightButton('xxx', [{
        title: '+',
        iconPath: '',
        callback: function() {
            
        }
    }]);

    CPNavigationBar.setLeftButton({
        title : lang.back,
        iconPath : '',
        callback : function () {
            CPNavigationBar.returnPreviousPage();
        }
    });
    /* eslint-enable */
};

page.bindEvents = function () {
    /* eslint-disable */
    $('#main').on('click', '.list-item', function () {
        var id = $(this).data('id');

        if (id) {
            CPNavigationBar.redirect('/task-detail.html?task_id=' + id);
        }
    });

    $('#search-input').on('click', function () {
        CPNavigationBar.redirect('/search-search.html');
    });
    /* eslint-enable */
};

/**
 * 初始化顶部 tab
 */
page.initTab = function () {
    // var me = this;

    var $tab = $('.tab');
    var $ul = $tab.find('ul');
    $tab.width(999);
    $ul.width($ul.width());
    $tab.width('auto');

    setTimeout(function () {

        // 初始化 scroll
        new IScroll('.tab', {
            scrollX: true,
            scrollY: false,
            scrollbars: false,
            click: true,

            // 禁用监听鼠标和指针
            disableMouse: true,
            disablePointer: true,

            mouseWheel: false,

            // 快速触屏的势能缓冲开关
            momentum: false
        });
    }, 0);
};

/**
 * 初始化配置 滑动切换页面 函数
 *
 */
page.initPage = function () {
    var me = this;

    new PageSlider({
        outer: '.slider-outer',
        tabs: '.tab-page li',
        pages: pages,

        onSlide: function (info) {
            me.loadPage(info);

            // if (info.name === 'done' || info.name === 'cancel') {
            //     $('.search-inner').addClass('border');
            // }
            // else {
            //     $('.search-inner').removeClass('border');
            // }
        }
    });
};

/**
 * 加载页面
 *
 * @param {Object} info, 当前展示的页面配置
 * @param {Object} data, 当前要渲染的模板数据
 */
page.loadPage = function (info) {
    // var me = this;
    // var dfd = new $.Deferred();

    if (!info || !info.name) {
        return;
    }

    if (pageCache[info.name]) {
        return;
    }

    var $wrapper = $(info.selector);
    var $tab = $wrapper.find('.tab');
    var $loader = $wrapper.find('.load-more');
    var $search = $('#search');
    var $fixbar = $('.tab-page');

    // 10: margin
    var offset = 5
                + $search.height()
                + $fixbar.height()
                + ($tab.length ? $tab.height() : 0)
                + ($loader.length ? $loader.height() : 0);

    /* eslint-disable */
    require.ensure(['./list/item'], function () {

        var template = require('./list/item');

        new InitPage({
            wrapper: $wrapper.find('.scroll-outter'),
            main: '.list-wrapper-content',
            promise: function () {
                return page.get(config.API.GET_TASK_LIST, {
                    role: rid,
                    curr_page: this.page,
                    number: 10
                });
            },
            tpl: template,
            offset: offset,
            lang: page.lang
        });
    });
    /* eslint-enable */

    pageCache[info.name] = {
        name: info.name
    };
};

/**
 * 请求页面接口
 *
 * @param {deferred} dfd, deferred
 *
 */
page.addParallelTask(function (dfd) {
    this.loadPage(pages[0]);
    dfd.resolve();
});

$(function () {
    page.start();
});
