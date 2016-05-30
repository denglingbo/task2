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

// 页码提示
require('common/ui/pagination/pagination.scss');
var Pagination = require('common/ui/pagination/pagination');


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
        return raw.status(this.status, this.end_time);
    };
    data.importanceRaw = function () {
        return raw.importance(this.importance_level);
    };
    data.endTimeRaw = function () {
        return raw.dateToDone(this.end_time);
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
    // 是否进入重载范围
    me._reloadRange = false;
    // 是否允许重新加载
    me._reloadAllow = false;
    me._reloadFailed = false;

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

        me.getMoreData(function (data) {
            me.initScroll();

            // 初始化一个分页提示控件
            me.pagination = new Pagination({
                wrapper: me.$wrapper,
                // 每个数据容器
                elems: '.list-item',
                // data-pagenum，数据来源
                finder: 'pagenum',
                pageNum: data.number,
                // 可视偏移量
                offset: -60,
                total: data.total,
                // 在屏幕下方作为展示的基准点
                screen: 1
            });
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

            me.pagination.process(this.y);
        });

        me.scroll.on('scrollStart', function () {

            // 允许重新刷新，设置滚动到指定位置，scrollEnd 必须要再进行一次设置
            me._reloadAllow = false;
            me._reloadFailed = false;
        });

        // 监听滚动结束
        me.scroll.on('scrollEnd', function () {
            // 允许重新刷新，设置滚动到指定位置，scrollEnd 必须要再进行一次设置
            if (me._reloadFailed) {
                me.scroll.scrollTo(0, 30);
            }
        });

        // 监听一下 进入 重载界定 到 touchend 的鼠标 touch 时长
        $(document).on('touchend', function () {
            me.reloadEndTime = +new Date();

            // 准备进行数据重载
            if (me._reloadRange === true) {
                me._reloadAllow = true;
                me.getmore.statusChange('reload', 'process');
                me.getReloadData();
            }
        });
    },

    reset: function () {

        // 重置参数
        this._reloading = false;
        this._reloadRange = false;
        this._moring = false;
    },

    getReloadData: function (callback) {
        var me = this;

        me.getmore.requestReload()
            .done(function (data, unchanged) {

                // 最新数据没有变化，不进行后面的 dom 操作
                if (unchanged) {
                    return;
                }

                // 用于分页提示
                data.pagenum = this.page;
                dealData(data);
                me.getmore.render(data);
                me.setBasic();
                me.scroll.refresh();
                me.reset();
            })
            .fail(function () {
                me._reloadFailed = true;
                me.reset();
            })
            .always(function () {
                callback && callback();
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
            // 用于分页提示
            data.pagenum = this.page;
            dealData(data);
            this.render(data, 'append');
            me.setBasic();

            callback && callback(data);

            // 请求新数据之后，重新查找分页提示的 dom
            me.pagination.complete();
        });
    },

    reloadStartTime: 0,
    reloadEndTime: 0,

    /**
     * 检查是否需要重新加载数据
     *
     * @param {Element} scroll, new Scroll() 返回的scroll 实例
     */
    checkReload: function (scroll) {
        var me = this;

        // 如果已经允许重载，则不再进行状态设置
        if (me._reloadAllow) {
            scroll.scrollTo(0, 30);
        }
        if (me._reloadFailed) {
            me.scroll.scrollTo(0, 30);
        }

        if (me._reloadFailed || me._reloadAllow) {
            return;
        }

        if (scroll.y > 0 && me._reloading === false && me._reloadRange === false) {
            me.getmore.statusChange('reload', 'default');
        }

        // 到达临界点
        if (scroll.y >= 80 && me._reloading === false) {
            me.getmore.statusChange('reload', 'holder');

            me.reloadStartTime = +new Date();

            // 允许重载
            me._reloadRange = true;
        }
        // 脱离重载临界值
        else {
            me._reloadRange = false;
        }
    },

    /**
     * 检查是否需要加载更多
     *
     * @param {Element} scroll, new Scroll() 返回的scroll 实例
     */
    checkMore: function (scroll) {
        var me = this;

        if (scroll.maxScrollY - scroll.y > 60 && me._moring === false) {

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
