/**
 * @file pageSlider.js
 * @author deo
 *
 * 滑动切换页面
 * @param {Ojbect} options,
 *
 */
var Slide = require('../../slide');

var elementStyle = document.createElement('div').style;
var vendor = (function () {
    var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'];
    var transform;
    var len = vendors.length;

    for (var i = 0; i < len; i++) {
        transform = vendors[i] + 'ransform';
        if (transform in elementStyle) {
            return vendors[i].substr(0, vendors[i].length - 1);
        }
    }

    return false;
})();

/**
 * 获取当前浏览器下的 css3 key
 *
 * @param {string} style, 样式名 transform, ...
 * @return {string}, 当前浏览器下的样式名
 *
 */
function prefixStyle(style) {
    if (vendor === false) {
        return false;
    }
    if (vendor === '') {
        return style;
    }
    return vendor + style.charAt(0).toUpperCase() + style.substr(1);
}

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
        'slideNum': 80,
        // 要切换的页面 配置 {Array}
        'pages': [],

        'class': {},

        'onInit': function () {},
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

        var item = this.get();

        // 获取第一个
        me.opts.onInit.call(me, item);

        me.page = item.index;
        me.defaultX = 0;
        me.winWidth = $(window).width();
        me.winHeight = $(window).height();

        this.$pages.each(function (i) {

            var num = i * 100;
            $(this).css({
                width: me.winWidth
                // ,'transform': 'translate3d(' + num + '%, 0px, 0px)'
            });

            this.style[prefixStyle('transform')] = 'translate3d(' + num + '%, 0px, 0px)';
        });

        this.bindEvents();
    },

    /**
     * 获取当前或指定name 的配置项
     *
     * @param {string|undefined} name, 可传递项，不传则返回‘当前’对象
     * @return {Object}
     *
     */
    get: function (name) {

        var obj = null;

        this.opts.pages.forEach(function (item) {

            // 获取指定 name
            if (name !== undefined) {
                if (item.name === name) {
                    obj = item;
                }
            }
            // 获取默认
            else {
                if (item.current) {
                    obj = item;
                }
            }
        });

        return obj;
    },

    /**
     * 查找对象
     *
     * @return {Object}, 配置项
     *
     */
    find: function () {
        var item = this.opts.pages[this.page];

        return item;
    },

    /**
     * 绑定事件
     *
     */
    bindEvents: function () {
        var me = this;

        // Hey my go
        // slide 包用来界定用户的滑动行为
        this.slide = new Slide('.slider-container');

        this.$items.on('click', function (event) {
            // me.switch.call(me, event.target);
            var $tab = $(event.target);
            var index = $tab.index();

            me.run(index);
        });

        this.slide.on('slideX', function (pos) {
            me.$outer.removeClass('slide-fast');
        });

        this.slide.on('slideMoveX', function (event, pos) {
            // 正数表示往右，负数表示往左
            me.step = (pos.diffX / me.winWidth) * 100;
            var step = me.step + me.defaultX;

            // me.$outer.css({
            //     'transform': 'translate3d(' + step + '%, 0px, 0px)'
            // });

            me.$outer[0].style[prefixStyle('transform')] = 'translate3d(' + step + '%, 0px, 0px)';
        });

        this.slide.on('slideEndX', function (event, pos) {
            var item = me.find(event);
            me.gotoPage(item, pos);
        });
    },

    /**
     * 切换页面
     *
     * @param {Object} item, item 对象信息
     * @param {Object} pos, 位置信息
     *
     */
    gotoPage: function (item, pos) {
        var len = this.opts.pages.length - 1;
        var to = 0;

        if (Math.abs(pos.diffX) > this.opts.slideNum) {
            // 往右
            if (pos.diffX < 0) {
                to = item.index + 1;
            }
            // 往左移动
            else {
                to = item.index - 1;
            }
        }
        // 返回
        else {
            to = item.index;
        }

        // fix 左侧
        if (to < 0) {
            to = 0;
        }
        if (Math.abs(to) > len) {
            to = len;
        }

        this.run(to);
    },

    /**
     * 切换动画
     *
     * @param {number} to, 位移到的索引位置
     *
     */
    run: function (to) {
        var item = this.findByIndex(to);
        var step = to * 100 * -1;

        this.opts.onSlideBefore.call(this, item);

        // this.$outer.css({
        //     'transform': 'translate3d(' + step + '%, 0px, 0px)'
        // });

        this.$outer[0].style[prefixStyle('transform')] = 'translate3d(' + step + '%, 0px, 0px)';

        this.$outer.addClass('slide-fast');

        this.defaultX = step;
        this.page = to;
    },

    /**
     * 通过索引值查找对象
     *
     * @param {number} index, 索引
     * @return {Object}, 配置项
     *
     */
    findByIndex: function (index) {
        var temp = null;
        this.opts.pages.forEach(function (item) {
            if (index === item.index) {
                temp = item;
            }
        });
        return temp;
    }
};

module.exports = PageSlider;
