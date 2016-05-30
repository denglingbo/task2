/**
 * @file getmore.js
 * @author deo
 *
 * 点击加载功能，不需要指定内容容器，该组建点击之后会返回 data
 * require getmore.scss
 */

require('./getmore.scss');

var md5 = require('dep/md5');
var Control = require('common/control');

// 重载完成时候的占位 class，临时保持加载状态一直可见
var placeholder = 'data-reload-place';

/**
 * 获取重载的 dom 节点
 */
var getReloadTemplate = function (classObject) {

    var c = {};
    var obj = classObject.reload;

    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            c[key] = obj[key].replace(/^\./, '');
        }
    }

    return '<div class="data-reload-tips ' + c.default + ' hide">下拉刷新</div>'
        + '<div class="' + c.holder + ' hide">释放刷新</div>'
        + '<div class="' + c.process + ' hide">加载中</div>'
        + '<div class="' + c.fail + ' hide">数据加载失败，请重试</div>'
        + '<div class="' + c.unchanged + ' hide">已经是最新数据</div>'
        + '<div class="' + c.done + ' hide">加载完成</div>';
};

/**
 * 获取加载条的 dom 节点
 */
var getMoreTemplate = function (classObject) {

    var c = {};
    var obj = classObject.more;

    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            c[key] = obj[key].replace(/^\./, '');
        }
    }

    return '<span class="' + c.default + ' hide">加载更多</span>'
        + '<span class="' + c.process + ' hide">'
            + '<div class="loading-status">'
                + '<span class="loading"></span>'
                + '<span class="loading-text">加载中</span>'
            + '</div>'
        + '</span>'
        + '<span class="' + c.done + ' hide">加载完成</span>'
        + '<span class="' + c.max + ' hide">所有数据加载完成</span>'
        + '<span class="' + c.fail + ' hide">数据加载失败，请重试</span>';
};

var _SELECTOR = {

    more: {
        default: '.data-more-holder',
        process: '.data-more-process',
        done: '.data-more-done',
        max: '.data-more-max',
        fail: '.data-more-fail'
    },

    reload: {
        default: '.data-reload-default',
        process: '.data-reload-process',
        holder: '.data-reload-holder',
        done: '.data-reload-done',
        fail: '.data-reload-fail',
        unchanged: '.data-reload-unchanged'
    }
};
        
var timerId = null;

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

        // 默认第几页
        page: 1,

        wrapper: null,

        // promise 一定要在 function 内部 return，不然一万年都不是一个新的请求了
        promise: null,

        // 每次请求后端会返回的 list 长度，默认为 10条，如果返回的 list.length 小于这个值，就认为没有新数据了
        pageNum: 10,

        reloadHandler: '.data-reload',

        // 点击按钮，触发事件
        moreHandler: '.data-more',

        // 要进行比较的字段，如果 null， 则对整个 object 进行比较
        // 后端 data.list
        dataKey: 'list',

        // data.total
        totalKey: 'total',

        reloadDisable: false,
        moreDisable: false,

        // 点击状态的 选择器对象
        status: _SELECTOR,

        // 加载更多模版数据
        reloadTemplate: getReloadTemplate(_SELECTOR),

        // 加载更多模版数据
        moreTemplate: getMoreTemplate(_SELECTOR),

        // 是否进行相同数据比较
        changedCompare: false
    };

    $.extend(me.opts, options);

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
     * 添加一些必须的dom 或者属性
     */
    init: function () {
        var me = this;

        me.createMoreHtml();

        me.createReloadHtml();

        me.statusChange('more', 'default');

        me.bindEvents();
    },

    /**
     * 对数据进行 md5
     *
     * @param {Object|...} data, 数据
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
     * @param {Object|...} data, 数据
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
     * @param {Object|...} data, 用于比较的数据
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
     *
     * @param {string} moreTemplate, 模板字符串
     */
    createReloadHtml: function (reloadTemplate) {
        var html = reloadTemplate || this.opts.reloadTemplate;

        this.$reloadHandler.html(html);
    },

    /**
     * 添加 内部 more loader dom 节点
     *
     * @param {string} moreTemplate, 模板字符串
     */
    createMoreHtml: function (moreTemplate) {
        var html = moreTemplate || this.opts.moreTemplate;

        this.$moreHandler.html(html);
    },

    /**
     * 绑定事件
     */
    bindEvents: function () {
        var me = this;

        this.$moreHandler.on('click', function (event) {
            event.stopPropagation();
            event.preventDefault();

            // 是否需求加载更多，由 requestMore 进行判断
            me.requestMore(function (data) {
                me.fire('loadmore', data);
            });
        });
    },

    /**
     * 请求数据
     *
     * @param {Function} callback [options], 回调函数
     */
    send: function (callback) {
        var me = this;
        var dfd = new $.Deferred();

        // 请求开始时间
        me.reqStart = +new Date();

        me.promise()
            .done(function (result) {

                if (result.meta && result.meta.code !== 200) {
                    callback && callback.call(me, false);
                    return;
                }

                var data = result.data;

                // First data
                if (me._compare === null) {
                    me.storeMD5Data(data);
                }

                callback && callback.call(me, data);

                me.page ++;
            })
            .fail(function (err) {
                callback && callback.call(me, false);
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
     */
    hasReload: function () {
        if (this.opts.reloadDisable === true) {
            return false;
        }
        return this.$reloadHandler.length ? true : false;
    },

    /**
     * 判断是否允许使用 加载更多
     */
    hasMore: function () {
        if (this.opts.moreDisable === true) {
            return false;
        }
        return this.$moreHandler.length ? true : false;
    },

    /**
     * 重载数据 接口
     *
     * @param {string} status 要展示的状态
     * @param {number} delay 延迟执行时间
     */
    requestReload: function () {
        var me = this;

        if (me.hasReload() === false) {
            return;
        }

        var dfd = new $.Deferred();

        // 开始请求
        me.statusChange('reload', 'process');

        var curpage = me.page;

        // 重置 page
        me.page = 1;

        me.send(function (data) {

            if (data) {

                var unChanged = me.dataUnChanged(data);

                // 最新数据没有变化，不进行后面的操作
                if (unChanged) {
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
            }
        });

        return dfd;
    },

    /**
     * 请求更多数据 接口
     *
     * @param {string} status 要展示的状态
     * @param {number} delay 延迟执行时间
     */
    requestMore: function (fn) {
        var me = this;

        // 如果数据已经加载完毕，则不再进行 ajax 请求
        if (me.isAllLoaded() || me.hasMore() === false) {
            return;
        }

        // 开始请求
        me.statusChange('more', 'process');

        me.send(function (data) {

            if (data) {

                // 当前数据长度
                var list = data[me.opts.dataKey] || [];

                // 记录总的数据长度
                me._total = data[me.opts.totalKey];

                // 添加数据长度
                me._length = me._length + list.length;

                // 以下两种情况认为数据已经加载完毕
                if (// 所有数据已经加载完成
                    me.isAllLoaded()
                    // 当前请求回来的数据长度小于 request 的 pagenum
                    || list.length < me.opts.pageNum
                ) {
                    me.statusChange('more', 'max');
                }
                else {
                    me.statusChange('more', 'done');
                    me.statusChange('more', 'default', 300);
                }
            }
            else {
                me.statusChange('more', 'fail');
            }

            fn && fn.call(me, data);
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

        if (!barObj || !barObj[status]) {
            return;
        }

        // 设置父级元素
        var $bar = me.$moreHandler;
        if (/reload/.test(bar)) {
            $bar = me.$reloadHandler;
        }

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

    reloadStatus: function () {

    }
});

module.exports = Getmore;
