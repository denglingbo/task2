/**
 * @file pageSlider.js
 * @author deo
 *
 * 滑动切换页面
 * @param {Ojbect} options,
 *
 */
// var Slide = require('common/ui/slide');
var util = require('common/util');

/**
 * 滑屏切换页面
 *
 * @param {Object} options, 配置项
 *
 */
var PageSlider = function (options) {

    if (!options) {
        // console.warn('pageSlider.js options not array.');
        return;
    }

    this.opts = {
        // 最外层容器
        'outer': null,
        // tabs
        'tabs': null,
        // 滑动 num 值，开始切换并加载新页面
        'slideNum': 50,
        // 要切换的页面 配置 {Array}
        'pages': {},

        'class': {},

        'slide': false,

        // 'onInit': function () {},
        'onSlide': function () {},
        'onSlideBefore': function () {}
    };

    $.extend(this.opts, options);

    this.$outer = $(this.opts.outer);
    this.$items = $(this.opts.tabs);
    this.$pages = $('.slider-page');

    this.init();
};

PageSlider.prototype = {

    /**
     * 初始化
     *
     */
    init: function () {

        var me = this;

        // var item = this.find('opened');

        // me.page = item.index;
        me.defaultX = 0;
        me.winWidth = $(window).width();
        me.winHeight = $(window).height();

        $(this.opts.outer).css({
            width: me.winWidth,
            height: me.winHeight - ($('#search').length ? $('#search').height() : 0)
        });

        this.$pages.each(function (i) {
            $(this).width(me.winWidth);
            this.style[util.prefixStyle('transform')] = 'translate3d(' + i * 100 + '%, 0px, 0px)';
        });

        this.bindEvents();

        $('.page-opened').trigger('click');
    },

    /**
     * 获取当前或指定name 的配置项
     *
     * @param {string|undefined} name, 可传递项，不传则返回‘当前’对象
     * @return {Object}
     *
     */
    find: function (name) {
        return this.opts.pages[name];
    },

    /**
     * 绑定事件
     *
     */
    bindEvents: function () {
        var me = this;

        this.$items.off('click').on('click', function (event) {
            event.stopPropagation();
            // event.preventDefault();

            var $click = $(this);
            var key = $click.data('name');

            me.gotoPage(this, key);

            $click.siblings().removeClass('selected');
            $click.addClass('selected');
        });
    },

    /**
     * 切换动画
     *
     * @param {Element} target, 点击的 tab 项
     * @param {string} key, page name
     */
    gotoPage: function (target, key) {
        var item = this.find(key);
        var step = item.index * 100 * -1;

        this.opts.onSlide.call(this, target, item);

        this.$outer[0].style[util.prefixStyle('transform')] = 'translate3d(' + step + '%, 0px, 0px)';

        this.$outer.addClass('slide-fast');
    }
};

module.exports = PageSlider;
