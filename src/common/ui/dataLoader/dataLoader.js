/**
 * @file dataLoader.js
 * @author deo
 *
 * 点击加载功能，不需要指定内容容器，该组建点击之后会返回 data
 * require dataLoader.scss
 *
 * 如果要直接调用 dataLoader.render() 请给 options.tpl 传值
 *
 * <待重构，功能实现完毕，暂未优化以及分包>
 */

require('./dataLoader.scss');

var md5 = require('dep/md5');
var Control = require('common/control');
var IScroll = require('dep/iscroll');
var util = require('common/util');
var template = require('./template');
var selector = require('./selector');
var lang = require('./lang');

// 重载完成时候的占位 class，临时保持加载状态一直可见
var placeholder = 'data-reload-place';

/**
 * 数据加载器
 *
 * @param {Ojbect} options, 配置项
 *  options.promise: 用于 ajax
 */
var DataLoader = function (options) {

    Control.call(this, options);

    var me = this;

    me.opts = {

        // 默认第几页
        page: 1,

        wrapper: null,

        // 该 tpl 根据后端数据进行渲染的模版，由 Control 进行负责操作
        tpl: null,

        // promise 一定要在 function 内部 return，不然一万年都不是新的请求
        promise: null,

        // 每次请求后端会返回的 list 长度，默认为 10条，如果返回的 list.length 小于这个值，就认为没有新数据了
        pageNum: 10,

        reloadHandler: '.data-reload',

        // 点击按钮，触发事件
        moreHandler: '.data-more',

        // 如果没有数据，则不显示状态条
        moreNullHidden: false,

        // 加载触发的方式
        // 0: click
        // 1: scroll
        loadType: 1,

        // 要进行比较的字段，如果 null， 则对整个 object 进行比较
        // 后端 data.list
        dataKey: 'list',

        // data.total
        totalKey: 'total',

        reloadDisable: false,

        moreDisable: false,

        lang: lang,

        // 点击状态的 选择器对象
        status: selector,

        // 是否进行相同数据比较
        changedCompare: false,

        initClick: true,

        // 加载更多模版数据
        reloadTemplate: function (tpl) {
            return tpl || template.reload(this.status, this.lang && this.lang.reload);
        },

        // 加载更多模版数据
        moreTemplate: function (tpl) {
            return tpl || template.more(this.status, this.lang && this.lang.more);
        }
    };

    $.extend(true, me.opts, options);

    me.page = me.opts.page;
    me.promise = me.opts.promise;

    // $wrapper 用于 control 的渲染输出 html 的容器
    me.$wrapper = $(me.opts.wrapper);

    // 刷新
    me.$reloadHandler = $(me.opts.reloadHandler);

    // 加载更多
    me.$moreHandler = $(me.opts.moreHandler);

    // 储存第一次的数据，用于重载的数据比较，如果数据一致，则不再进行 render
    me._compare = null;

    // 界定是否加载完毕所有数据
    me._total = null;

    // 已经加载的数据长度
    me._length = 0;

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

    // 缓存上一次的数据，用于新请求数据的比较
    me._compare = null;

    me.init();
};

$.extend(DataLoader.prototype, Control.prototype);

$.extend(DataLoader.prototype, {

    reqStart: 0,

    reqEnd: 0,

    // 更改状态
    statusTimerId: null,

    /**
     * 添加一些必须的dom 或者属性
     */
    init: function () {
        var me = this;

        me.createMoreHtml();

        me.createReloadHtml();

        me.statusChange('more', 'default');

        me.bindEvents();

        if (me.opts.loadType === 1) {
            me.initScroll();
        }
    },

    /**
     * 对数据进行 md5
     *
     * @param {Object} data, 数据
     * @return {string} md5 string
     */
    md5Data: function (data) {

        // Object 需要 stringify
        if ($.isPlainObject(data)) {
            return md5(JSON.stringify(data));
        }

        return md5(data);
    },

    /**
     * 储存 md5 数据
     *
     * @param {Object} data, 数据
     */
    storeMD5Data: function (data) {
        this._compare = {
            md5: this.md5Data(data),
            data: data
        };
    },

    /**
     * 是否数据有变化
     *
     * @param {Object} data, 用于比较的数据
     * @return {boolean} 数据是否有变化
     */
    dataUnChanged: function (data) {

        var md5Data = this.md5Data(data);

        if (!this._compare) {
            return true;
        }

        if (md5Data === this._compare.md5) {
            return true;
        }

        return false;
    },

    /**
     * 添加 内部 more loader dom 节点
     */
    createReloadHtml: function () {
        this.$reloadHandler.html(this.opts.reloadTemplate());
    },

    /**
     * 添加 内部 more loader dom 节点
     */
    createMoreHtml: function () {
        this.$moreHandler.html(this.opts.moreTemplate());
    },

    /**
     * 绑定事件
     */
    bindEvents: function () {
        var me = this;

        // 绑定点击加载更多
        if (me.opts.loadType === 0) {

            this.$moreHandler
                .off('click')
                .on('click', function (event) {

                    event.stopPropagation();
                    event.preventDefault();

                    if (me.isAllLoaded()) {
                        me.fire('alldone', null);
                        return;
                    }

                    // 是否需求加载更多，由 requestMore 进行判断
                    me.requestMore(function (err, data) {
                        me.fire('more', err, data);
                    });
                });

            // 默认触发
            if (me.opts.initClick) {
                me.moreClick();
            }
        }
    },

    moreClick: function () {
        if (this.opts.loadType === 0) {
            this.$moreHandler.triggerHandler('click');
        }
    },

    /**
     * 请求数据
     *
     * @param {Function} callback [options], 回调函数
     */
    send: function (callback) {
        var me = this;
        // var dfd = new $.Deferred();

        // 如果禁用，不再发送请求
        if (this._disabled) {
            return;
        }

        // 请求开始时间
        me.reqStart = +new Date();

        me.promise()
            .done(function (result) {

                if (result.meta && result.meta.code !== 200) {
                    callback && callback.call(me, result.meta);
                    return;
                }

                var data = result.data;

                // First data
                if (me._compare === null) {
                    me.storeMD5Data(data);
                }

                callback && callback.call(me, null, data);

                me.page ++;
            })
            .fail(function (err) {
                callback && callback.call(me, err || true);
            })
            .always(function () {
                me.reqEnd = +new Date();
            });
    },

    /**
     * 是否所有数据加载完成
     *
     * @return {boolean}
     */
    isAllLoaded: function () {
        if (this._total === null) {
            return false;
        }
        return this._total <= this._length;
    },

    /**
     * 判断是否允许使用 reload
     *
     * @return {boolean} 是否能使用 reload 功能
     */
    hasReload: function () {
        if (this.opts.reloadDisable === true || this.$reloadHandler.length === 0) {
            return false;
        }
        return true;
    },

    /**
     * 判断是否允许使用 加载更多
     *
     * @return {boolean} 是否能使用 more 功能
     */
    hasMore: function () {
        if (this.opts.moreDisable === true || this.$moreHandler.length === 0) {
            return false;
        }
        return true;
    },

    /**
     * 设置 reload 的可用性
     */
    reloadDisable: function () {
        this.opts.reloadDisable = true;
    },

    /**
     * 设置 more 的可用性
     */
    moreDisable: function () {
        this.opts.moreDisable = true;
    },

    /**
     * 重载数据 接口
     *
     * @return {Deferred}
     */
    requestReload: function () {
        var me = this;
        var dfd = new $.Deferred();

        if (me.hasReload() === false) {
            dfd.reject(null);
            return dfd;
        }

        // 开始请求
        me.statusChange('reload', 'process');

        var curpage = me.page;

        // 记录一下当前page 页
        var curPageNum = me.page;

        // 重置 page
        me.page = 1;

        me.send(function (err, data) {

            if (data) {

                var unChanged = me.dataUnChanged(data);

                // 最新数据没有变化，不进行后面的操作
                if (unChanged) {
                    // 如果没有重载整个 dom 区，则恢复 me.page
                    me.page = curPageNum;
                    me.statusChange('reload', 'unchanged');
                    dfd.resolve.call(me, data, unChanged);
                    return;
                }

                // 每次重载之后，都需要保存 md5 数据
                me.storeMD5Data(data);

                // 设置length
                me._length = me.opts.pageNum;

                me.statusChange('reload', 'done', 0, 200);
                me.$wrapper.html('');
                dfd.resolve.call(me, data);
            }
            else {
                me.page = curpage;
                me.statusChange('reload', 'fail');
                dfd.reject(null);

                me._reloadFailed = true;
            }

        });

        return dfd;
    },

    /**
     * 请求更多数据 接口
     *
     * @param {Function} fn 回调
     */
    requestMore: function (fn) {
        var me = this;

        // 如果数据已经加载完毕，则不再进行 ajax 请求
        if (me.isAllLoaded() || me.hasMore() === false) {
            fn && fn.call(me, null);
            return;
        }

        // 开始请求
        me.statusChange('more', 'process');

        me.send(function (err, data) {

            if (err || !data) {
                me.statusChange('more', 'fail');
                fn && fn.call(me, err);
                return;
            }

            // 设置加载更多的标记
            me._moring = false;

            // 当前数据长度
            var list = data[me.opts.dataKey] || [];

            // 记录总的数据长度
            me._total = data[me.opts.totalKey];

            // 添加数据长度
            me._length = me._length + me.opts.pageNum;

            if (list.length <= 0) {
                if (me.opts.moreNullHidden) {
                    me.statusChange('more');
                }
                else {
                    me.statusChange('more', 'nodata');
                }

                fn && fn.call(me, null, data);
                return;
            }

            if (me.$wrapper.hasClass('hide')) {
                me.$wrapper.removeClass('hide');
            }

            // 以下两种情况认为数据已经加载完毕
            if (me.isAllLoaded() || me._total - me._length <= 0) {
                me.statusChange('more', 'max');
            }
            else {
                me.statusChange('more', 'done');
                me.statusChange('more', 'default', 300);
            }

            fn && fn.call(me, null, data);


            me.moreLoaded();
        });
    },

    /**
     * 状态条的控制
     *
     * @param {Element} $cur, 当前状态元素
     */
    displayer: function ($cur) {
        $cur.removeClass('hide');
        $cur.siblings().addClass('hide');
    },

    hideMore: function () {
        this.statusChange('more');
    },

    /**
     * 加载条状态
     *
     * @param {string} bar 要操作的控件 more or reload
     * @param {string} status 要展示的状态
     * @param {number} delay 状态条延迟执行时间
     * @param {number} outterDelay 外层容器隐藏 延迟
     */
    statusChange: function (bar, status, delay, outterDelay) {
        var me = this;

        clearTimeout(me.statusTimerId);

        var barObj = me.opts.status[bar];

        if (!barObj) {
            return;
        }

        // 设置父级元素
        var $bar = me.$moreHandler;
        if (/reload/.test(bar)) {
            $bar = me.$reloadHandler;
        }

        if (!status) {
            $bar.addClass('hide');
            return;
        }

        $bar.removeClass('hide');

        var $cur = $bar.find(barObj[status]) || null;

        if (!$cur || !$cur.length) {
            return;
        }

        if (!delay) {
            me.displayer($cur);
        }
        else {
            me.statusTimerId = setTimeout(function () {
                me.displayer($cur);
            }, delay);
        }

        // 重载的情况下需要特殊处理
        if (/reload/.test(bar)) {

            if (/default/.test(status)) {
                $bar.removeClass('hide');
                $bar.removeClass(placeholder);
            }

            if (/done/.test(status)) {
                // clearTimeout(timerId);
                // me.displayer($cur);
            }

            if (/fail/.test(status)) {
                // $bar.addClass(placeholder);

                // 控制外层容器
                // 失败
                // timerId = setTimeout(function () {
                    // $bar.addClass(placeholder);
                // }, outterDelay);
            }
        }
    },


    /**
     * 初始化 iscroll
     */
    initScroll: function () {
        var me = this;

        me.destroyScroll();
        var $scrollWrapper = $(me.opts.scrollWrapper);

        // setTimeout(function () {

        // 初始化 scroll
        me.scroll = new IScroll($scrollWrapper[0], {

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
            // 苹果打开势能
            momentum: util.isApple()
        });

        me.bindScrollEvents();
        // }, 0);
    },

    bindScrollEvents: function () {
        var me = this;

        // 监听滚动
        me.scroll.on('scroll', function () {
            var target = this;
            me.checkReload(target);
            me.checkMore(target);

            me.fire('scrolling', me, target);
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
        $(document).off('touchend').on('touchend', function () {
            me.reloadEndTime = +new Date();

            // 准备进行数据重载
            if (me._reloadRange === true) {
                me._reloadAllow = true;
                me.statusChange('reload', 'process');

                me.fire('scrollReload', me);
            }
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
            me.statusChange('reload', 'default');
        }

        // 到达临界点
        if (scroll.y >= 80 && me._reloading === false) {
            me.statusChange('reload', 'holder');

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

            me.fire('scrollMore', me);

            me._moring = true;
        }
    },

    moreLoaded: function () {
        // 允许下次加载
        this._moring = false;

        // iscroll 刷新
        this.scroll && this.scroll.refresh();
    },

    reset: function () {

        // 重置参数
        this._reloading = false;
        this._reloadRange = false;
        this._moring = false;
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
});

module.exports = DataLoader;
