/* eslint-disable */
// var Control = require('common/control');

var Loader = function (options) {

    // Control.call(this, options);

    this.opts = {
        // 默认第几页
        page: 1,

        promise: null,

        // 要进行比较的字段，如果 null， 则对整个 object 进行比较
        // 'list'
        dataKey: null,

        // 是否进行相同数据比较
        changedCompare: false
    };

    $.extend(this.opts, options);

    this.promise = this.opts.promise;

    this.page = this.opts.page;
};

// $.extend(Loader.prototype, Control.prototype);

$.extend(Loader.prototype, {

    // 缓存上一次的数据，用于新请求数据的比较
    _compare: null,

    reqStart: 0,

    reqEnd: 0,

    /**
     * 是否数据有变化
     *
     * @param {Object|...} data, 用于比较的数据
     */
    isDataChanged: function (data) {
        if (this._compare === null || !this.opts.changedCompare) {
            return true;
        }

        var data1;
        var data2;

        if (this.opts.dataKey === null) {
            data1 = this._compare;
            data2 = data;
        }
        else {
            data1 = this._compare[this.opts.dataKey];
            data2 = data[this.opts.dataKey];
        }

        // 如果有某个字段有问题，也返回 true
        if (data1 === undefined || data2 === undefined) {
            return true;
        }

        if (data1.toString() === data2.toString()) {
            return false;
        }

        return true;
    },

    /**
     * 请求数据
     *
     * @param {Function} fn [options], 回调函数
     */
    req: function (fn) {
        var me = this;
        var dfd = new $.Deferred();

        // 请求开始时间
        me.reqStart = +new Date();

        this.promise()
            .done(function (result) {
                if (result.meta && result.meta.code !== 200) {
                    fn && fn.call(me, false);
                    return;
                }

                var data = result.data;

                var isChanged = me.isDataChanged(data);

                // 保存一个比较用的数据
                me._compare = data;

                fn && fn.call(me, data, isChanged);

                // 如果数据有变化，则 page + 1
                if (isChanged) {
                    me.page ++;
                }
            })
            .fail(function (err) {
                fn && fn.call(me, false);
            })
            .always(function () {
                me.reqEnd = +new Date();
            });
    }

});

module.exports = Loader;
