/**
 * @file slide.js
 * @author deo
 *
 * 触屏滑动基类，待优化
 */

var Control = require('common/control');

var EVENTS = {
    slideX: 'slideX',
    slideY: 'slideY',
    slideDir: 'slideDir',
    slideMoveX: 'slideMoveX',
    slideMoveY: 'slideMoveY',
    slideMove: 'slideMove',
    slideEndX: 'slideEndX',
    slideEndY: 'slideEndY',
    slideEnd: 'slideEnd'
};

var Slide = function (selector) {

    Control.call(this);

    this.$elem = $(selector);

    this._events = {};

    // 位置信息
    this._pos = {};

    this.name = 'slide';

    // 用户行为
    // -1
    // 0: 横向滑动
    // 1: 竖向滑动
    this._dir = -1;

    this._timerId = null;

    this.init();
};

$.extend(Slide.prototype, Control.prototype);

$.extend(Slide.prototype, {

    /**
     * 初始化
     *
     */
    init: function () {
        this.bindEvents();
    },

    /**
     * 清空数据
     *
     */
    clearData: function () {
        this._pos = {};
        this._timerId = null;
        this._dir = -1;

        clearTimeout(this._timerId);
    },

    /**
     * 绑定事件入口
     *
     */
    bindEvents: function () {
        var me = this;

        // Touch start
        this.$elem.on('touchstart', function (event) {
            event.preventDefault();

            var touch = event.touches[0];

            me.clearData();

            me._pos.startX = touch.clientX;
            me._pos.startY = touch.clientY;
        });

        // Touch move
        this.$elem.on('touchmove', function (event) {

            var touch = event.touches[0];

            me._pos.x = touch.clientX;
            me._pos.y = touch.clientY;

            me._pos.diffX = me._pos.x - me._pos.startX;
            me._pos.diffY = me._pos.y - me._pos.startY;

            me.moveListener(event);
        });

        // Touch end
        this.$elem.on('touchend', function (event) {
            event.preventDefault();

            if (me._dir === 0) {
                me.fire(EVENTS.slideEndX, me._pos);
            }
            else if (me._dir === 1) {
                me.fire(EVENTS.slideEndY, me._pos);
            }

            me.fire(EVENTS.slideEnd, me._dir, me._pos);
        });
    },

    /**
     * 鼠标移动
     *
     * @param {Event} event, 事件
     */
    moveListener: function (event) {
        var me = this;

        var diffX = Math.abs(me._pos.diffX);
        var diffY = Math.abs(me._pos.diffY);

        if (me._timerId === null) {
            me._timerId = setTimeout(function () {

                var data = {
                    x: me._pos.startX,
                    y: me._pos.startY
                };

                // 左右滑屏
                if (diffX > diffY) {
                    me._dir = 0;
                    me.fire(EVENTS.slideX, data);
                }
                // 上下滑屏
                else {
                    me._dir = 1;
                    me.fire(EVENTS.slideY, data);
                }

                me.fire(EVENTS.slideDir, me._dir, data);
            }, 10);
        }
        if (me._dir === 0) {
            me.fire(EVENTS.slideMoveX, me._pos);
        }
        else if (me._dir === 1) {
            me.fire(EVENTS.slideMoveY, me._pos);
        }

        me.fire(EVENTS.slideMove, me._dir, me._pos);

    }
});

module.exports = Slide;
