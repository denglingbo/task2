/**
 * @file ticker.js
 * @author deo
 *
 * 点击变打勾
 */

require('./ticker.scss');

var Listener = require('common/listener');

/**
 * 变打勾
 *
 * @param {Element|selector} target, 元素
 * @param {Ojbect} options, 配置项
 */
var Ticker = function (target, options) {
    var me = this;

    me.opts = {
        async: false
    };

    this.$elem = $(target);

    $.extend(me.opts, options);

    this.init();
};

var CLASSES = {
    UNTICK: 'untick',
    TICKED: 'ticked',
    CIRCLE_SQUARE: 'tick-circle-to-square',
    TICKED_ANIMATE: 'tick-ticked-animate',
    SQUARE_CIRCLE: 'tick-square-to-circle',
    UNTICK_ANIMATE: 'tick-untick-animate'
};

Ticker.prototype = new Listener();

$.extend(Ticker.prototype, {
    init: function () {
        this.bindEvents();
    },

    bindEvents: function () {
        var me = this;
        var isCurTicked = false;

        this.$elem.on('click', function () {

            if (!me.opts.async) {
                me.changeStatus();
                isCurTicked = me.$elem.hasClass(CLASSES.UNTICK);
            }
            else {
                isCurTicked = !me.$elem.hasClass(CLASSES.UNTICK);
            }

            // 点击的时候是否为勾选状态
            me.execEvent('click', isCurTicked);
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

    ticked: function () {
        this.$elem
            .removeClass(CLASSES.UNTICK)
            .removeClass(CLASSES.TICKED)
            .removeClass(CLASSES.UNTICK_ANIMATE)
            .removeClass(CLASSES.SQUARE_CIRCLE)
            .addClass(CLASSES.CIRCLE_SQUARE)
            .addClass(CLASSES.TICKED_ANIMATE);
    },

    untick: function () {
        this.$elem
            .addClass(CLASSES.UNTICK)
            .addClass(CLASSES.TICKED)
            .removeClass(CLASSES.CIRCLE_SQUARE)
            .removeClass(CLASSES.TICKED_ANIMATE)
            .addClass(CLASSES.UNTICK_ANIMATE)
            .addClass(CLASSES.SQUARE_CIRCLE);
    }
});

module.exports = Ticker;
