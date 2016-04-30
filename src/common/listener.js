/**
 * @file listener
 * @author deo
 *
 * 事件相关基类
 */

var Listener = function () {
    this._events = {};
};

Listener.prototype = {

    /**
     * 监听事件
     *
     * @param {string|Array} type, 事件类型, 'click', ['click', 'move']
     * @param {Function} fn, 回调函数
     *
     */
    on: function (type, fn) {
        var arr;
        var me = this;

        if (!type) {
            return;
        }

        if (!$.isArray(type)) {
            arr = [type];
        }
        else {
            arr = type;
        }

        arr.forEach(function (t) {
            if (!me._events[t]) {
                me._events[t] = [];
            }

            me._events[t].push(fn);
        });
    },

    /**
     * 执行绑定的事件
     *
     * @param {string} type, 事件类型
     *
     */
    execEvent: function (type) {
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

module.exports = Listener;
