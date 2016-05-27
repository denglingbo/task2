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
        + '<div class="' + c.process + ' hide">加载中</div>'
        + '<div class="' + c.holder + ' hide">释放刷新</div>'
        + '<div class="' + c.fail + ' hide">数据加载失败，请重试</div>'
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
        default: '.reload-default',
        process: '.reload-process',
        holder: '.reload-holder',
        done: '.reload-done',
        fail: '.reload-fail'
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

                var isChanged = me.isDataChanged(data);

                // 保存一个比较用的数据
                me._compare = data;

                callback && callback.call(me, data, isChanged);

                // 如果数据有变化，则 page + 1
                if (isChanged) {
                    me.page ++;
                }
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

        me.page = 1;

        me.send(function (data) {

            if (data) {
                me.statusChange('reload', 'done');
                me.$wrapper.html('');
                dfd.resolve(data);
            }
            else {
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
     * 加载条状态
     *
     * @param {string} bar 要操作的控件 more or reload
     * @param {string} status 要展示的状态
     * @param {number} delay 延迟执行时间
     */
    statusChange: function (bar, status, delay) {
        var me = this;

        clearTimeout(me.statusTimerId);

        var barObj = me.opts.status[bar];

        if (!barObj || !barObj[status]) {
            return;
        }

        // 设置父级元素
        var $elem = me.$moreHandler;

        if (bar === 'reload') {
            $elem = me.$reloadHandler;

            if (status === 'done') {
                clearTimeout(timerId);
                timerId = setTimeout(function () {
                    $elem.addClass('hide');
                }, 100);
            }

            if (status === 'default') {
                $elem.removeClass('hide');
            }
        }

        var $cur = $elem.find(barObj[status]) || null;

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
