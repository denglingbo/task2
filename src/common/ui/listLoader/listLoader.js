/**
 * @file listLoader.js
 * @author deo
 *
 * 点击加载功能，不需要指定内容容器，该组建点击之后会返回 data
 * require ticker.scss
 */

require('./listLoader.scss');

var Control = require('common/control');

var getDom = function (classObject) {

    var domClass = {};

    for (var key in classObject) {
        if (classObject.hasOwnProperty(key)) {
            domClass[key] = classObject[key].replace(/^\./, '');
        }
    }

    return '<span class="' + domClass.default + ' hide">点击加载更多</span>'
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
var Loader = function (options) {

    Control.call(this, options);

    var me = this;

    me.opts = {
        // promise 一定要在 function 内部 return，不然一万年都不是一个新的请求了
        promise: null,

        // 每次请求后端会返回的 list 长度，默认为 10条，如果返回的 list.length 小于这个值，就认为没有新数据了
        pageNum: 10,

        // 点击按钮，触发事件
        handler: '.load-more',

        // 后端 data.list
        listKey: 'list',

        // 点击状态的 选择器对象
        status: STATUS_CLASS,

        // 点击状态模版数据
        template: getDom(STATUS_CLASS)
    };

    $.extend(me.opts, options);

    me.promise = me.opts.promise;

    me.$main = $(me.opts.handler);

    // 当前是第几页数据
    me.page = 1;

    me.init();
};

$.extend(Loader.prototype, Control.prototype);

$.extend(Loader.prototype, {

    // 更改状态
    statusTimerId: null,

    /**
     * 添加一些必须的dom 或者属性
     */
    init: function () {
        var me = this;

        this.addDom();

        if (me.opts.promise) {
            me.req(function (data) {
                me.fire('complete', data);
            });
        }
        else {
            me.fire('complete');
        }

        this.bindEvents();
    },

    /**
     * 添加 内部 dom节点
     *
     * @param {string} template, 模板字符串
     */
    addDom: function (template) {
        var html = template || this.opts.template;

        this.$main.html(html);
    },

    bindEvents: function () {
        var me = this;

        this.$main.on('click', function () {

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

        var $cur = me.$main.find(me.opts.status[status]) || null;

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
    },

    // 请求开始 时间戳
    reqStart: 0,

    // 请求结束 时间戳
    reqEnd: 0,

    /**
     * 异步请求 此处需要一个 promise
     *
     * @param {Function} fn, 回调
     */
    req: function (fn) {
        var me = this;

        me.statusChange('process');

        // 请求开始时间
        me.reqStart = +new Date();

        var promise = me.promise();

        promise
            .done(function (result) {
                if (result.meta && result.meta.code !== 200) {
                    fn.call(me, false);
                    return;
                }

                var data = result.data;
                var list = data[me.opts.listKey];

                if (!list) {
                    fn.call(me, null);
                    return;
                }

                if (list.length < me.opts.pageNum) {
                    me.$main.addClass('hide');
                }
                else {
                    me.$main.removeClass('hide');
                }

                me.statusChange('done');
                me.statusChange('default', 380);

                fn.call(me, data);

                me.page ++;
            })
            .fail(function (err) {
                clearTimeout(me.statusTimerId);
                me.statusChange('fail');

                fn.call(me, false);
            })
            .always(function () {
                me.reqEnd = +new Date();
            });
    }
});

module.exports = Loader;
