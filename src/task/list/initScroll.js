/**
 * @file initScroll.js
 * @author deo
 *
 * 初始化滚动 test [没有实现完成]
 */

// var config = require('../../config');
var IScroll = require('dep/iscroll');

var lang = {

    loader: {
        'doing': '加载中',
        'done': '加载完成',
        'default': '加载更多'
    }
};

/**
 * 初始化滚动
 *
 * @param {Object} page, new Page()
 * @param {Object} slidePage, 滚动 slidePage页 的配置
 *
 */
function InitScroll(page, slidePage) {
    if (!slidePage || !slidePage.name) {
        return;
    }

    var me = this;
    var selector = slidePage.selector;

    me.destroyScroll();

    me.page = page;
    me.$elem = $(selector);
    me.$loader = me.$elem.find('.scroll-loader');

    me.winWidth = $(window).width();
    me.winHeight = $(window).height();
    me._scroll = null;

    // 是否加载完成
    me._load = false;

    // 是否进行刷新
    me._refresh = false;

    this.setSize();

    me._scroll = new IScroll(selector, {
        probeType: 2,
        scrollX: false,
        scrollY: true,
        scrollbars: false,
        mouseWheel: true
    });

    this.bindEvents();
}

InitScroll.prototype = {

    /**
     * 刷新bar 展示方式
     *
     * @param {Element} scroll, new Scroll() 返回的scroll 实例
     *
     */
    showBar: function (scroll) {
        if (scroll.maxScrollY - scroll.y > 0 && !this.$loader.hasClass('hide')) {
            this.$loader.removeClass('hide');
        }
    },

    /**
     * 加载条刷新
     *
     * @param {Element} scroll, new Scroll() 返回的scroll 实例
     *
     */
    refreshBar: function (scroll) {
        if (scroll.maxScrollY - scroll.y > 50) {
            this._refresh = true;
            this.$loader.html(lang.loader.doing);
        }
        else {
            this._refresh = false;
        }
    },

    /**
     * Destroy
     *
     */
    destroyScroll: function () {

        if (this._scroll) {
            this._scroll.destroy();
            this._scroll = null;
        }
    },

    /**
     * 设置一些基础样式
     *
     */
    setSize: function () {

        // 这里要先获取高度
        var objHeight = this.$elem.height();

        // 保证页面的最小高度
        if (objHeight < this.winHeight) {
            objHeight = this.winHeight;
        }
        // 当文档高度大于屏幕，则展示加载条
        // 这里因为loader 具有高度，所以需要重新获取
        else {
            this.$elem.find('.scroll-loader').removeClass('hide');

            // 44 为底部 fixed tab 的高度
            objHeight = this.$elem.height() + 44;
        }

        this.$elem.find('.scroll-inner').css({
            height: objHeight
        });

        // 设置滚动的元素的高宽
        this.$elem.css({
            width: this.winWidth,
            height: this.winHeight
        });

        this.$elem.height(this.winHeight);
    },

    /**
     * 绑定事件
     *
     */
    bindEvents: function () {
        var me = this;

        // 监听滚动
        me._scroll.on('scroll', function () {

            me.showBar(this);
            me.refreshBar(this);
        });

        // 监听滚动结束
        me._scroll.on('scrollEnd', function () {
            // Ajax New Data
            // $loader.addClass('hide');
            if (me._refresh) {
                me.$loader.html(lang.loader.default);
            }
            // console.log(config.API.LIST_MORE_URL)
            // if (!me._load) {
            //     me.page.post(config.API.LIST_MORE_URL)
            //         .done(function () {
            //             // console.log('load more');
            //             me._load = false;
            //         });
            // }
        });
    }
};

module.exports = InitScroll;
