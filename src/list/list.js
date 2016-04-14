/**
 * @file list.js
 * @author deo
 * 列表页
 *
 */

require('./list.scss');

var config = require('../config');
var Page = require('../common/page');
// var Sticky = require('../ui/js/sticky');
var PageSlider = require('../common/ui/pageSlider/pageSlider');
var IScroll = require('dep/iscroll');
var page = new Page();

var pages = [
    {
        name: 'doing',
        selector: '#list-wrapper-doing',
        index: 0,
        url: './pages/doing',
        current: true
    },
    {
        name: 'done',
        selector: '#list-wrapper-done',
        url: './pages/done',
        api: config.API.LIST_DONE_URL,
        index: 1
    },
    {
        name: 'cancel',
        selector: '#list-wrapper-cancel',
        url: './pages/cancel',
        index: 2
    }
];

// 当前屏幕中的 页面
var pageName = null;

// 所有 tab 页面的对象
var pageCache = {};

page.enter = function () {

    var me = this;

    me.winHeight = $(window).height();

    // new Sticky({target: selector, top: 0});

    // this.scrollInit('.slider-scroll');

    new PageSlider({
        outer: '.slider-outer',
        tabs: '.tab-page li',
        pages: pages,

        onInit: function (info) {
            me.loadPage(info, me.data);
        },

        onSlideBefore: function (info) {
            me.loadMoreList(info.api, function (result) {
                me.loadPage(info, result.data);
            });
        }
    });

    this.bindEvents();
};

page.bindEvents = function () {

};

// 用于销毁 myScroll 等操作
var myScroll;

/**
 * 加载页面
 *
 * @param {Object} info, 当前展示的页面配置
 * @param {Object} data, 当前要渲染的模板数据
 *
 */
page.loadPage = function (info, data) {
    var me = this;

    pageName = info.name;

    require.ensure(['./pages/doing', './pages/done', './pages/cancel'], function (require) {
        if (!pageCache[info.name]) {
            var template = require(info.url);
            var $content = $(info.selector).find('.list-wrapper-content');
            me.render($content, template, data);

            // 缓存页面信息
            pageCache[info.name] = {
                y: 0
            };
        }

        // 这里要重新渲染 scroll，所以需要重设置外层的高度
        var objHeight = $(info.selector).height();

        if (objHeight < me.winHeight) {
            objHeight = me.winHeight;
        }
        else {
            $(info.selector).find('.scroll-loader').removeClass('hide');
            objHeight = $(info.selector).height();
        }

        $('.slider-outer').css({
            // 这里因为loader 具有高度，所以需要重新获取
            height: objHeight
        });
        $(info.selector).css({
            // 这里因为loader 具有高度，所以需要重新获取
            height: objHeight
        });

        if (myScroll) {
            myScroll.refresh();

            var prevY = pageCache[info.name].y || 0;
            myScroll.scrollTo(0, prevY);
        }
    });
};

/**
 * 初始化滚动
 *
 * @param {Element} selector, 滚动的外层容器
 *
 */
page.scrollInit = function (selector) {
    var me = this;

    $(selector).height(me.winHeight);

    if (myScroll) {
        myScroll.destroy();
        myScroll = null;
    }

    myScroll = new IScroll(selector, {
        probeType: 2,
        scrollX: true,
        scrollY: true,
        scrollbars: false,
        mouseWheel: true,
        interactiveScrollbars: true,
        shrinkScrollbars: 'scale',
        fadeScrollbars: true
    });

    var $loader = $('.scroll-loader');

    myScroll._load = false;

    // 刷新bar 展示方式
    myScroll._show = function () {
        if (this.maxScrollY - this.y > 0) {
            $loader.removeClass('hide');
        }
    };

    // 拉取新页面入口
    myScroll._refresh = function () {
        if (this.maxScrollY - this.y > 50) {
            this._load = true;
            $loader.html(config.const.loader.doing);
        }
    };

    // 监听滚动
    myScroll.on('scroll', function () {
        // 记录当前滚动页面的 y 坐标
        if (pageCache && pageName && pageCache[pageName]) {

            if (this.y < 0) {
                pageCache[pageName].y = Math.max(this.y, this.maxScrollY);
            }
            else {
                pageCache[pageName].y = 0;
            }

        }

        this._show();
        this._refresh();
    });

    // 监听滚动结束
    myScroll.on('scrollEnd', function () {
        // Ajax New data
        // $loader.addClass('hide');
        $loader.html(config.const.loader.default);

        if (this._load) {
            me.loadMoreList(config.API.LIST_MORE_URL, function (result) {
                console.log(result)

                myScroll._load = false;
            });
        }
    });


};

/**
 * 滚动刷新时，加载更多内容
 *
 * @param {Function} callback, 回调函数
 *
 */
page.loadMoreList = function (api, callback) {
    // var dfd = new $.Deferred();
    var promise = page.post(api, {});

    promise
        .done(function (result) {
            if (result.status !== 0) {
            }
            else {
                callback(result);
            }
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
    var promise = page.post(config.API.LIST_URL, {});

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
