/**
 * @file getmore.js
 * @author deo
 *
 * 点击加载功能，不需要指定内容容器，该组建点击之后会返回 data
 * require getmore.scss
 */

require('./getmore.scss');

var Loader = require('common/ui/loader');
var Control = require('common/control');

/**
 * 获取加载条的 dom 节点
 */
var getLoaderTpl = function (classObject) {

    var domClass = {};

    for (var key in classObject) {
        if (classObject.hasOwnProperty(key)) {
            domClass[key] = classObject[key].replace(/^\./, '');
        }
    }

    return '<span class="' + domClass.default + ' hide">加载更多</span>'
        + '<span class="' + domClass.process + ' hide">'
            + '<div class="loading-status">'
                + '<span class="loading"></span>'
                + '<span class="loading-text">加载中</span>'
            + '</div>'
        + '</span>'
        + '<span class="' + domClass.done + ' hide">加载完成</span>'
        + '<span class="' + domClass.max + ' hide">所有数据加载完成</span>'
        + '<span class="' + domClass.fail + ' hide">数据加载失败，请重试</span>';
};

// 状态的 class
var STATUS_CLASS = {
    'default': '.load-more-holder',
    'process': '.load-more-process',
    'done': '.load-more-done',
    'max': '.load-more-max',
    'fail': '.load-more-fail'
};

/**
 * 点击加载更多主函数
 *
 * @param {Ojbect} options, 配置项
 *  options.promise: 用于 ajax
 */
var Getmore = function (options) {

    Control.call(this, options);

    var me = this;

    me.opts = {
        wrapper: null,

        // promise 一定要在 function 内部 return，不然一万年都不是一个新的请求了
        promise: null,

        // 每次请求后端会返回的 list 长度，默认为 10条，如果返回的 list.length 小于这个值，就认为没有新数据了
        pageNum: 10,

        // 点击按钮，触发事件
        handler: '.load-more',

        // 要进行比较的字段，如果 null， 则对整个 object 进行比较
        // 后端 data.list
        dataKey: 'list',

        totalKey: 'total',

        // 点击状态的 选择器对象
        status: STATUS_CLASS,

        // 点击状态模版数据
        loaderTpl: getLoaderTpl(STATUS_CLASS),

        // 默认第几页
        page: 1,

        // 是否进行相同数据比较
        changedCompare: false
    };

    $.extend(me.opts, options);

    me.page = me.opts.page;
    me.promise = me.opts.promise;

    // $wrapper 用于 control 的渲染输出 html 的容器
    me.$wrapper = $(me.opts.wrapper);
    me.$handler = $(me.opts.handler);

    // 界定是否加载完毕所有数据
    me._total = null;

    // 已经加载的数据长度
    me._length = 0;

    // 初始化一个分页 loader
    // me.loader = new Loader(me.opts);

    me.init();
};

$.extend(Getmore.prototype, Control.prototype);

$.extend(Getmore.prototype, {

    // 缓存上一次的数据，用于新请求数据的比较
    _compare: null,

    reqStart: 0,

    reqEnd: 0,

    // 更改状态
    statusTimerId: null,

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
    request: function (fn) {
        var me = this;
        var dfd = new $.Deferred();

        // 请求开始时间
        me.reqStart = +new Date();

        me.promise()
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
    },

    /**
     * 添加一些必须的dom 或者属性
     */
    init: function () {
        var me = this;

        me.createLoader();

        if (me.opts.promise) {

            me.req(function (data, isChanged) {
                me.fire('complete', data);
            });
        }
        else {
            me.fire('complete');
        }
        
        me.statusChange('default');

        me.bindEvents();
    },

    /**
     * 添加 内部 loader dom 节点
     *
     * @param {string} loaderTpl, 模板字符串
     */
    createLoader: function (loaderTpl) {
        var html = loaderTpl || this.opts.loaderTpl;

        this.$handler.html(html);
    },

    bindEvents: function () {
        var me = this;

        this.$handler.on('click', function () {

            if (me.opts.promise) {
                me.req(function (data) {
                    me.fire('loadmore', data);
                });
            }
            else {
                me.fire('loadmore');
            }
        });
    },

    /**
     * 请求数据接口
     *
     * @param {string} status 要展示的状态
     * @param {number} delay 延迟执行时间
     */
    req: function (fn) {
        var me = this;

        clearTimeout(me.statusTimerId);
        
        // 如果数据已经加载完毕，则不再进行 ajax 请求
        if (me.isAllLoaded()) {
            return;
        }

        // 开始请求
        me.statusChange('process');

        me.request(function (data) {

            if (data) {

                // 当前数据长度
                var list = data[me.opts.dataKey] || [];

                // 记录总的数据长度
                me._total = data[me.opts.totalKey];

                // 添加数据长度
                me._length = me._length + list.length;

                // 以下两种情况认为数据已经加载完毕
                if (
                    // 所有数据已经加载完成
                    me.isAllLoaded()

                    // 当前请求回来的数据长度小于 request 的 pagenum
                    || list.length < me.opts.pageNum
                ) {
                    me.statusChange('max');
                }
                else {
                    me.statusChange('done');
                    me.statusChange('default', 300);
                }
            }
            else {
                me.statusChange('fail');
            }

            fn && fn.call(me, data);
        });
    },

    isAllLoaded: function () {
        if (this._total === null) {
            return false;
        }

        return this._total <= this._length;
    },

    /**
     * 加载条状态
     *
     * @param {string} status 要展示的状态
     * @param {number} delay 延迟执行时间
     */
    statusChange: function (status, delay) {
        var me = this;

        clearTimeout(me.statusTimerId);

        if (!me.opts.status || !me.opts.status[status]) {
            return;
        }

        var $cur = me.$handler.find(me.opts.status[status]) || null;

        if (!$cur || !$cur.length) {
            return;
        }

        if (delay === undefined) {
            $cur.removeClass('hide');
            $cur.siblings().addClass('hide');
        }
        else {
            me.statusTimerId = setTimeout(function () {
                $cur.removeClass('hide');
                $cur.siblings().addClass('hide');
            }, delay);
        }
    }
});

module.exports = Getmore;
