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
var SliderPage = require('../common/ui/sliderPage/sliderPage');
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

    me._windowHeight = $(window).height();

    // new Sticky({target: selector, top: 0});

    this.scrollInit('.slider-scroll');

    new SliderPage({
        selector: '.tab-page li',
        pages: pages,

        onStart: function (cur) {
            me.loadPage(cur);
        },

        onSlideBefore: function (cur, prev) {
            // console.log(pageCache);
            me.loadPage(cur);
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
 * @param {Object} obj, 当前展示的页面配置
 *
 */
page.loadPage = function (obj) {
    var me = this;

    pageName = obj.name;

    require.ensure(['./pages/doing', './pages/done', './pages/cancel'], function (require) {
        if (!pageCache[obj.name]) {
            var template = require(obj.url);
            var $content = $(obj.selector).find('.list-wrapper-content');
            me.render($content, template, me.data);

            // 缓存页面信息
            pageCache[obj.name] = {
                y: 0
            };
        }

        // 这里要重新渲染 scroll，所以需要重设置外层的高度
        var objHeight = $(obj.selector).height();
        if (objHeight < me._windowHeight) {
            objHeight = me._windowHeight;
        }

        $('.slider-outer').css({
            height: objHeight
        });

        myScroll.refresh();

        var prevY = pageCache[obj.name].y || 0;
        myScroll.scrollTo(0, prevY);
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

    $(selector).height(me._windowHeight);

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
            me.loadMoreList(function () {
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
page.loadMoreList = function (callback) {
    // var dfd = new $.Deferred();
    var promise = page.post(config.API.LIST_MORE_URL, {});

    promise
        .done(function (result) {
            if (result.status !== 0) {
            }
            else {
                // console.log(result);
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
