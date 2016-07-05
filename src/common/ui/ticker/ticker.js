/**
 * @file ticker.js
 * @author deo
 *
 * 点击单选按钮变成打勾的动画效果
 * require ticker.scss
 */

require('./ticker.scss');

var Control = require('common/control');

var CLASSES = {
    UNTICK: 'untick',
    TICKED: 'ticked',
    CIRCLE_SQUARE: 'tick-circle-to-square',
    TICKED_ANIMATE: 'tick-ticked-animate',
    SQUARE_CIRCLE: 'tick-square-to-circle',
    UNTICK_ANIMATE: 'tick-untick-animate'
};

/**
 * 打勾的动画函数包
 *
 * @param {Element|selector} target, 元素
 * @param {Ojbect} options, 配置项
 *      @param {boolean} options.async 是否是点击之后发送异步请求
 *          options.async = true，组件需要在请求完成之后，在外部来设置点击后状态
 *      @param {boolean} options.animate 是否需要动画
 */
var Ticker = function (target, options) {

    Control.call(this, options);

    var me = this;

    me.opts = {
        async: false,
        animate: false
    };

    this.$elem = $(target);

    $.extend(me.opts, options);

    this.init();
};

$.extend(Ticker.prototype, Control.prototype);

$.extend(Ticker.prototype, {

    init: function () {
        this.addDom();

        this.bindEvents();
    },

    addDom: function () {
        this.$elem.html(
            '<div class="tick-inner">'
                + '<span class="tick-top"></span>'
                + '<span class="tick-right"></span>'
                + '<span class="tick-bottom"></span>'
                + '<span class="tick-left"></span>'
            + '</div>'
        );
    },

    bindEvents: function () {
        var me = this;
        var isCurTicked = false;

        this.$elem.on('click', function (event) {
            event.stopPropagation();
            event.preventDefault();

            if (!me.opts.async) {
                me.changeStatus();
                isCurTicked = me.$elem.hasClass(CLASSES.UNTICK);
            }
            else {
                isCurTicked = !me.$elem.hasClass(CLASSES.UNTICK);
            }

            // 点击的时候是否为勾选状态
            me.fire('tick', isCurTicked);
        });
    },

    changeStatus: function () {
        var curIsUntick = this.$elem.hasClass(CLASSES.UNTICK);

        // 勾选
        if (curIsUntick) {
            this.ticked();
        }
        // 取消勾选
        else {
            this.untick();
        }
    },

    /**
     * 勾选
     */
    ticked: function () {
        if (!this.opts.animate) {
            this.$elem
                .removeClass(CLASSES.UNTICK)
                .addClass(CLASSES.TICKED);
        }
        else {
            this.$elem
                .removeClass(CLASSES.UNTICK)
                .removeClass(CLASSES.TICKED)
                .removeClass(CLASSES.UNTICK_ANIMATE)
                .removeClass(CLASSES.SQUARE_CIRCLE)
                .addClass(CLASSES.CIRCLE_SQUARE)
                .addClass(CLASSES.TICKED_ANIMATE);
        }
    },

    /**
     * 取消
     */
    untick: function () {
        if (!this.opts.animate) {
            this.$elem
                .addClass(CLASSES.UNTICK)
                .removeClass(CLASSES.TICKED);
        }
        else {
            this.$elem
                .addClass(CLASSES.UNTICK)
                .addClass(CLASSES.TICKED)
                .removeClass(CLASSES.CIRCLE_SQUARE)
                .removeClass(CLASSES.TICKED_ANIMATE)
                .addClass(CLASSES.UNTICK_ANIMATE)
                .addClass(CLASSES.SQUARE_CIRCLE);
        }
    }
});

module.exports = Ticker;
