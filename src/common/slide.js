/**
 * @file slide.js
 * @author deo
 * 触屏滑动基类
 *
 */

var Slide = function (selector) {

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

var EVENTS = {
    slideX: 'slideX',
    slideY: 'slideY',
    slideDir: 'slideDir',
    slideMoveX: 'slideMoveX',
    slideMove: 'slideMove',
    slideEndX: 'slideEndX',
    slideEndY: 'slideEndY',
    slideEnd: 'slideEnd'
};

Slide.prototype = {

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

        this.$elem.on('touchstart', function (event) {
            event.preventDefault();

            var touch = event.touches[0];

            me.clearData();

            me._pos.startX = touch.clientX;
            me._pos.startY = touch.clientY;
        });

        this.$elem.on('touchmove', function (event) {
            event.preventDefault();

            var touch = event.touches[0];

            me._pos.x = touch.clientX;
            me._pos.y = touch.clientY;

            me._pos.diffX = me._pos.x - me._pos.startX;
            me._pos.diffY = me._pos.y - me._pos.startY;

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
                        me._execEvent(EVENTS.slideX, event, data);
                    }
                    // 上下滑屏
                    else {
                        me._dir = 1;
                        me._execEvent(EVENTS.slideY, event, data);
                    }

                    me._execEvent(EVENTS.slideDir, event, me._dir, data);
                }, 10);
            }
            if (me._dir === 0) {
                me._execEvent(EVENTS.slideMoveX, event, me._pos);
            }
            else if (me._dir === 1) {
                me._execEvent(EVENTS.slideMoveY, event, me._pos);
            }

            me._execEvent(EVENTS.slideMove, event, me._dir, me._pos);
        });

        this.$elem.on('touchend', function (event) {
            event.preventDefault();

            if (me._dir === 0) {
                me._execEvent(EVENTS.slideEndX, event, me._pos);
            }
            else if (me._dir === 1) {
                me._execEvent(EVENTS.slideEndY, event, me._pos);
            }

            me._execEvent(EVENTS.slideEnd, event, me._dir, me._pos);
        });
    },

    /**
     * 监听事件
     *
     * @param {string} type, 事件类型
     * @param {Function} fn, 回调函数
     *
     */
    on: function (type, fn) {
        if (!this._events[type]) {
            this._events[type] = [];
        }

        this._events[type].push(fn);
    },

    /**
     * 执行绑定的事件
     *
     * @param {string} type, 事件类型
     *
     */
    _execEvent: function (type) {
        if (!this._events[type]) {
            return;
        }

        var len = this._events[type].length;

        if (!len) {
            return;
        }

        for (var i = 0; i < len; i++) {
            this._events[type][i].apply(this, [].slice.call(arguments, 1));
        }
    }
};

module.exports = Slide;
