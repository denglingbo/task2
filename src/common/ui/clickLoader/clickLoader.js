/**
 * @file loader.js
 * @author deo
 *
 * 点击加载功能
 */

require('./loader.scss');

var getDom = function (classObject) {

    var domClass = {};

    for (var key in classObject) {
        if (classObject.hasOwnProperty(key)) {
            domClass[key] = classObject[key].replace(/^\./, '');
        }
    }

    return '<span class="' + domClass.default + ' hide">点击加载更多</span>'
        + '<span class="' + domClass.process + '">'
            + '<div class="loading-status">'
                + '<span class="loading"></span>'
                + '<span class="loading-text">加载中</span>'
            + '</div>'
        + '</span>'
        + '<span class="' + domClass.done + ' hide">加载完成</span>';
};

var STATUS_CLASS = {
    'default': '.load-more-holder',
    'process': '.load-more-process',
    'done': '.load-more-done'
};

/**
 * 点击加载更多主函数
 *
 * @param {Ojbect} options, 配置项
 *  options.promise: 用于 ajax
 */
var Loader = function (options) {

    this.opts = {

        // 每次请求后端会返回的 list 长度，默认为 10条，如果返回的 list.length 小于这个值，就认为没有新数据了
        pageNum: 10,

        handler: '.load-more',

        status: STATUS_CLASS,

        template: getDom(STATUS_CLASS)
    };

    $.extend(this.opts, options);

    this.$main = $(this.opts.handler);

    this.init();
};

Loader.prototype = {

    /**
     * 添加一些必须的dom 或者属性
     */
    init: function () {
        this.addDom();
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

    },

    timerId: null,

    /**
     * 加载条状态
     *
     * @param {string} status 要展示的状态
     * @param {number} delay 延迟执行时间
     */
    statusChange: function (status, delay) {
        var me = this;
        clearTimeout(me.timerId);

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
            me.timerId = setTimeout(function () {
                $cur.removeClass('hide');
                $cur.siblings().addClass('hide');
            }, delay);
        }
    },

    /**
     * 异步请求 此处需要一个 promise
     *
     * @param {Promise} promise,
     * @param {Function} fn, 回调
     */
    req: function (promise, fn) {
        var me = this;

        me.statusChange('process');

        promise
            .done(function (result) {
                if (result.meta && result.meta.code !== 200) {
                    fn.call(me, false);
                    return;
                }

                var data = result.data;

                if (!data.list) {
                    fn.call(me, null);
                    return;
                }

                if (data.list.length < me.opts.pageNum) {
                    me.$main.addClass('hide');
                }
                else {
                    me.$main.removeClass('hide');
                }

                me.statusChange('done');
                me.statusChange('default', 380);

                fn.call(me, data);
            })
            .fail(function () {
                fn(me, false);
            });
    }
};

module.exports = Loader;
