/**
 * @file list.js
 * @author deo
 * 任务列表页
 *
 */

require('./list.scss');
require('common/widgets/search/searchEnter.scss');

var Page = require('common/page');
var page = new Page();

var config = require('../config');
var util = require('common/util');
var navigation = require('common/middleware/navigation');
// var Sticky = require('common/ui/sticky');

// 初始化 单页
var InitPage = require('./list/initPage');
// 初始化多页切换
var PageSlider = require('./list/pageSlider');
var pageTpl = require('./list/page');
var IScroll = require('dep/iscroll');

/**
 * role id
 * 1: 我派发的
 * 2: 我负责的
 * 3: 我参与的
 */
var rid = util.getParam('rid');

var Localdb = require('common/ui/localdb');
var coll = new Localdb(config.const.DATABASE_NAME, 'LIST');


/**
 * 缓存请求的 tab 页面数据
 */
var pageCache = {};

var pages = require('./list/config');

// 提前渲染模版
var data = {
    list: [
        {name: 'opened'},
        {name: 'doing'},
        {name: 'received'},
        {name: 'review'},
        {name: 'refuse'},
        {name: 'assignment'}
    ]
};

page.render('#opened-main', data, {
    partials: {
        page: pageTpl
    }
});

page.enter = function () {
    // var me = this;

    // new Sticky({target: '#search', top: 0});

    // 切换内容的 page 页
    this.initPageSlider();

    // 设置滚动的元素的高宽
    $('.slider-container').css({
        width: $(window).width(),
        height: $(window).height()
    });

    // 初始化顶部的 tab
    this.initTab();

    this.bindEvents();
};

page.deviceready = function () {
    var me = this;
    var lang = me.lang;

    navigation.left({
        title: lang.back,
        click: function () {
            navigation.open(-1, {
                title: me.lang.taskDetail
            });
        }
    });

    navigation.right([
        {
            icon: me._shell.right.add,
            click: function () {
                navigation.open('/task-new.html', {
                    referer: '/task-list.html?rid=' + rid,
                    title: me.lang.newTask
                });
            }
        }
    ]);
};

page.bindEvents = function () {
    var me = this;

    $('#main').on('click', '.list-item', function () {
        var id = $(this).data('id');

        if (id) {
            navigation.open('/task-detail.html?taskId=' + id, {
                title: me.lang.taskDetail
            });
        }
    });

    $('.search-in').on('click', function () {
        navigation.open('/search-search.html?role=' + rid, {
            title: me.lang.search
        });
    });
};

/**
 * 初始化顶部 tab
 */
page.initTab = function () {
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
page.initPageSlider = function () {
    // var me = this;

    new PageSlider({
        outer: '#slider-outer',
        tabs: '.page-loader li',
        pages: pages,

        onSlide: function (target, info) {

            switchPage(target, info);

            // var myPage = pageCache[info.name];

            new LoadPage(info);

            // 如果已经加载了页面，则只进行切换操作
            // setTimeout(function() {
            //     var myPage = pageCache[info.name]
            //     if (myPage && myPage.fn) {
            //         myPage.fn.pagination && myPage.fn.pagination.show();
            //         return;
            //     }
            // }, 0);
        }
    });
};

/**
 * 切换页面
 *
 * @param {Element} target, 点击的 tab
 * @param {Object} info, 当前展示的页面配置
 */
function switchPage(target, info) {

    if (!info || !info.name) {
        return;
    }

    // search bar 添加 border
    if (/done|cancel/.test(info.name)) {
        $('.search-inner').addClass('border');
    }
    else {
        $('.search-inner').removeClass('border');
    }

    var $wrapper = $(info.selector);
    var filter = $(target).data('filter');

    // 如果有数据的情况下，重新切换回 opened tab，则不触发opened 的 z 改变
    var myPage = pageCache[info.name];

    if (myPage) {

        // myPage.fn && myPage.fn.pagination.show();

        // 点击已有数据的未完成，要特殊处理下
        if (myPage.name === 'opened' && filter) {

            // var $second = $('.tab .selected');
            // var selectedName = $second.data('name');
            // pageCache[selectedName].fn.pagination.show();

            return;
        }
    }

    $wrapper.css({
        'z-index': 2
    });

    $wrapper.siblings().css({
        'z-index': 1
    });
}

/**
 * 加载页面
 *
 * @param {Object} info, 当前展示的页面配置
 */
function LoadPage(info) {

    if (pageCache[info.name]) {
        return;
    }

    // 这里只绑定数据
    pageCache[info.name] = {
        name: info.name,
        fn: null,
        data: null
    };

    var $wrapper = $(info.selector);
    var $tab = $('.tab');
    var $loader = $wrapper.find('.data-more');
    var $search = $('#search');
    var $fixbar = $('#fixbar');

    // num: margin
    var offset = 6
                + $search.height()
                + $fixbar.height()
                // 0 or undefined 才需要 这个高度, 未完成 的相关页都需要
                + (!info.index ? $tab.height() : 0)
                + ($loader.length ? $loader.height() : 0);

    require.ensure(['./list/item'], function () {

        var template = require('./list/item');
        var api = info.api || config.API.GET_TASK_LIST;

        pageCache[info.name].fn = new InitPage({
            isApple: page._shell.apple,
            wrapper: $wrapper.find('.scroll-outter'),
            main: '.list-wrapper-content',

            // ajax request
            promise: function () {

                var params = $.extend({
                    role: rid,
                    currPage: this.page,
                    number: 10
                }, info.params || {});

                return page.get(api, params);
            },

            onFirstDone: function (data) {
                pageCache[info.name].data = data;

                if (info.name === 'opened' && data) {

                    coll.update(data, {
                        rid: rid
                    });
                }
            },

            tpl: template,
            offset: offset,
            lang: page.lang
        });
    });
}

page.start();
