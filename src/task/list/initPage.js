/**
 * @file initScroll.js
 * @author deo
 *
 * 初始化滚动 test [没有实现完成]
 */

var IScroll = require('dep/iscroll');
var util = require('common/util');
var raw = require('common/widgets/raw');

var Getmore = require('common/ui/getmore/getmore');

/**
 * 批量处理数据
 *
 * @param {Object} data, data
 */
function dealData(data) {
    /* eslint-disable */
    // 时间展示
    data.updateDateRaw = function () {
        return util.formatDateToNow(this.op_time);
    };
    data.statusRaw = function() {
        return raw.status(this.status);
    };
    data.importanceRaw = function () {
        return raw.importance(this.importance_level);
    };
    data.endTimeRaw = function () {
        return util.dateformat(this.end_time);
    };
    data.isRemindUpdate = function () {
        return this.remind == 2;
    };
    data.isRemindNew = function () {
        return this.remind == 1;
    };
    /* eslint-enable */
}

/**
 * 初始化滚动
 *
 * @param {Object} options, options
 */
function Init(options) {

    var me = this;

    me.opts = {
        // 外容器，scroll 的外容器
        wrapper: null,

        // 实际内容容器
        // 这个 $main 将用于 getmore 的wrapper
        main: null,

        promise: null,
        offset: 0,
        lang: {},

        // getmore 需要使用
        dataKey: 'obj_list',
        tpl: null,

        onComplete: function () {}
    };

    $.extend(me.opts, options);

    me.lang = {
        'doing': me.opts.lang.loading,
        'done': me.opts.lang.dataDone,
        'default': me.opts.lang.getMore
    };

    me.$wrapper = $(me.opts.wrapper);
    me.$main = me.$wrapper.find(me.opts.main);

    me.scroll = null;

    // 是否加载完成
    me.load = false;

    // 是否进行刷新
    me._moring = false;

    // 重载动作
    me._reloading = false;
    // 是否允许重新加载
    me._reloadAllow = false;

    me.init();
}

Init.prototype = {

    init: function () {
        var me = this;

        // 这里的分页请求由 getmore 来处理
        me.getmore = new Getmore(
            $.extend(me.opts, {
                wrapper: me.$main,
                reloadHandler: me.$wrapper.find('.data-reload'),
                moreHandler: me.$wrapper.find('.data-more')
            })
        );

        me.getMoreData(function () {
            me.initScroll();
        });
    },

    /**
     * 基础设置
     */
    setBasic: function () {

        var me = this;

        // var width = $(window).width();
        var height = $(window).height();

        // 这里要先获取高度
        var objHeight = me.$main.height() + me.opts.offset;

        // 保证页面的最小高度
        if (objHeight < height) {
            objHeight = height;
        }

        // 很重要，这个实际用于滚动的容器需要设置可视高度
        me.$wrapper.find('.scroll-inner').css({
            height: objHeight
        });

        me.$wrapper.height(height);
    },

    initScroll: function () {
        var me = this;

        me.destroyScroll();

        setTimeout(function () {

            // 初始化 scroll
            me.scroll = new IScroll(me.$wrapper[0], {

                // 为了较为准确的加载数据，这里需要设置为 3
                probeType: 3,
                scrollX: false,
                scrollY: true,
                scrollbars: false,
                click: true,

                // 禁用监听鼠标和指针
                disableMouse: true,
                disablePointer: true,

                mouseWheel: false,

                // 快速触屏的势能缓冲开关
                momentum: true
            });

            me.bindEvents();
        }, 0);
    },

    bindEvents: function () {
        var me = this;

        // 监听滚动
        me.scroll.on('scroll', function () {
            me.checkReload(this);
            me.checkMore(this);
        });

        // 监听滚动结束
        me.scroll.on('scrollEnd', function () {

            // 允许重新刷新
            if (me._reloadAllow === true) {
                me.getReloadData();
            }
        });
    },

    getReloadData: function (callback) {
        var me = this;

        me.getmore.requestReload()
            .done(function (data) {

                dealData(data);
                me.getmore.render(data);
                me.setBasic();
                me.scroll.refresh();
            })
            .fail(function () {

            })
            .always(function () {
                // 设置加载更多的标记
                // me._reloading = false;

                callback && callback();

                me._reloading = false;
                me._reloadAllow = false;
            });
    },

    getMoreData: function (callback) {
        var me = this;

        me.getmore.requestMore(function (data) {

            if (!data) {
                return;
            }

            // 设置加载更多的标记
            me._moring = false;

            dealData(data);
            this.render(data, 'append');
            me.setBasic();

            callback && callback();
        });
    },

    /**
     * 检查是否需要重新加载数据
     *
     * @param {Element} scroll, new Scroll() 返回的scroll 实例
     */
    checkReload: function (scroll) {
        var me = this;

        if (scroll.y > 0 && me._reloading === false && me._reloadAllow === false) {
            me.getmore.statusChange('reload', 'default');
        }

        if (scroll.y > 60 && me._reloading === false) {
            me.getmore.statusChange('reload', 'holder');

            // 允许重载
            me._reloadAllow = true;
        }
    },

    /**
     * 检查是否需要加载更多
     *
     * @param {Element} scroll, new Scroll() 返回的scroll 实例
     */
    checkMore: function (scroll) {
        var me = this;

        if (scroll.maxScrollY - scroll.y > 60 && !me._moring) {

            me.getMoreData(function () {
                // 刷新滚 iscroll
                me.scroll.refresh();
            });

            me._moring = true;
        }
    },

    /**
     * Destroy
     *
     */
    destroyScroll: function () {

        if (this.scroll) {
            this.scroll.destroy();
            this.scroll = null;
        }
    }
};

module.exports = Init;
