/**
 * @file list.js
 * @author deo
 * 任务列表页
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
        url: './pages/item',
        current: true
    },
    {
        name: 'done',
        selector: '#list-wrapper-done',
        url: './pages/item',
        api: config.API.LIST_DONE_URL,
        index: 1
    },
    {
        name: 'cancel',
        selector: '#list-wrapper-cancel',
        url: './pages/item',
        api: config.API.LIST_CANCEL_URL,
        index: 2
    }
];

// 当前屏幕中的 页面
var pageName = null;

// 所有 tab 页面的对象
var pageCache = {};

page.enter = function () {

    var me = this;
    me.winWidth = $(window).width();
    me.winHeight = $(window).height();

    // new Sticky({target: selector, top: 0});
    $('.slider-outer').css({
        width: me.winWidth,
        height: me.winHeight
    });

    new PageSlider({
        outer: '.slider-outer',
        tabs: '.tab-page li',
        pages: pages,

        onInit: function (info) {
            me.loadPage(info, me.data);
        },

        onSlideBefore: function (info) {

            if (info && info.name && !pageCache[info.name]) {
                me.loadMoreList(info.api, function (result) {
                    me.loadPage(info, result.data);
                });
            }
        }
    });

    this.bindEvents();
};

page.bindEvents = function () {

};

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

    var fn = function () {

        var template = require(info.url);
        var $content = $(info.selector).find('.list-wrapper-content');
        me.render($content, template, data);

        // 为了 IScroll 一定能被绑定正确，需要添加一个 timeout
        setTimeout(function () {
            // 这里要先获取高度
            var objHeight = $(info.selector).height();

            // 缓存页面信息
            pageCache[info.name] = {
                y: 0
            };

            // 保证页面的最小高度
            if (objHeight < me.winHeight) {
                objHeight = me.winHeight;
            }
            // 当文档高度大于屏幕，则展示加载条
            // 这里因为loader 具有高度，所以需要重新获取
            else {
                $(info.selector).find('.scroll-loader').removeClass('hide');

                // 40 为底部 fixed page tab 的高度
                objHeight = $(info.selector).height() + 40;
            }

            $(info.selector).find('.scroll-inner').css({
                height: objHeight
            });

            // 设置滚动的元素的高宽
            $(info.selector).css({
                width: me.winWidth,
                height: me.winHeight
            });

            new InitScroll(info.selector);
        }, 0);
    };

    require.ensure(['./pages/doing', './pages/done', './pages/cancel'], fn);

};

/**
 * 滚动刷新时，加载更多内容
 *
 * @param {number} api, API 接口
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



/**
 * 初始化滚动
 *
 * @param {Element} selector, 滚动的外层容器
 *
 */
function InitScroll(selector) {
    var me = this;

    $(selector).height(me.winHeight);

    this._scroll = null;

    this._destroy();

    // myScroll = new IScroll(selector, {
    this._scroll = new IScroll(selector, {
        probeType: 2,
        scrollX: false,
        scrollY: true,
        scrollbars: false,
        mouseWheel: true
    });

    var $loader = $(selector).find('.scroll-loader');

    this._scroll._load = false;

    // 刷新bar 展示方式
    this._scroll._show = function () {
        if (this.maxScrollY - this.y > 0) {
            $loader.removeClass('hide');
        }
    };

    // 拉取新页面入口
    this._scroll._refresh = function () {
        if (this.maxScrollY - this.y > 50) {
            this._load = true;
            $loader.html(config.const.loader.doing);
        }
    };

    // 监听滚动
    this._scroll.on('scroll', function () {
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
    this._scroll.on('scrollEnd', function () {
        // Ajax New data
        // $loader.addClass('hide');
        $loader.html(config.const.loader.default);

        if (this._load) {
            page.loadMoreList(config.API.LIST_MORE_URL, function (result) {
                this._scroll._load = false;
            });
        }
    });
}

InitScroll.prototype._destroy = function () {

    if (this._scroll) {
        this._scroll.destroy();
        this._scroll = null;
    }
};
