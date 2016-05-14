/**
 * @file searchPlugin.js
 * @author hefeng
 * 搜索组件
 *
 */


require('./searchPlugin.scss');
require('dep/touch');
var view = require('common/view');
var Page = require('common/page');

// var IScroll = require('dep/iscroll');

/**
 * Search
 *
 * @param {string} selector, 需要初始化搜索框的容器;
 * @param {Object} options, 配置参数
 *      @param {Object} url config.API配置的请求
 *      @param {Array} listDir, 搜索结果中结果列表的目录层次, 到数组一级
 *      @param {string} inject, 搜索页的插入地方
 *      @param {string} keyClassName, 搜索结果中关键字的显示样式
 *      @param {string} itemTpl, 搜索结果的Mustache渲染模板
 * @constructor
 */
function Search(selector, options) {
    // this.destroySearch();
    var opts = {
        inject: 'body',
        listDir: [],
        keyClassName: 'input-key',
        url: '',
        itemTpl: '{{#.}}<li class="item"><a href="javascript:void(0);">{{& .}}</a></li>{{/.}}'
    };

    if (!$(selector).length) {
        return;
    }

    this.page = new Page();

    this.options = $.extend(opts, options, {
        selector: selector,
        wrap: '#search-wrap',
        page: '.search-page',
        content: '.search-content'
    });

    options = this.options;

    // 页面上展示的搜索框
    options.searchInHtml = '<div class="search-in"><i class="icon-search"></i>搜索</div>';

    // 无搜索结果页面
    options.searchNull = '<li class="no-output"><i class="icon-search-big"></i>暂无匹配结果</div>';

    // 搜索页面
    options.searchOutHtml = '<div id="search-wrap" class="search-wrap hide">'
                            + '<div class="search-inner">'
                                + '<div class="search-in search-input-wrap">'
                                    + '<input class="search-input">'
                                    + '<i class="icon-search"></i>'
                                    + '<span class="search-tip">搜索</span>'
                                    + '<i class="close-x clear hide"></i>'
                                + '</div>'
                                + '<span class="cancel">取消</span>'
                            + '</div>'
                            + '<div class="search-mask"></div>'
                            + '<div class="search-page hide">'
                                + '<ul class="search-content"></ul>'
                            + '</div>'
                        + '</div>';

    this.loadHtml();

    this.dom = {
        $main: $(options.selector),
        $wrap: $(options.wrap)
    };

    var dom = this.dom;
    var $wrap = dom.$wrap;
    var $main = dom.$main;

    $.extend(dom, {
        $searchIn: $main.find('.search-in'),
        $cancel: $wrap.find('.cancel'),
        $input: $wrap.find('.search-input'),
        $tip: $wrap.find('.search-tip'),
        $clear: $wrap.find('.clear'),
        $page: $wrap.find('.search-page'),
        $content: $wrap.find('.search-content'),
        $mask: $wrap.find('.search-mask')
    });

    this.bindEvents();
}

/**
 * 加载页面搜索框和搜索页面的html
 *
 */
Search.prototype.loadHtml = function () {
    var me = this;
    var options = me.options;

    $(options.selector).addClass('search-box');
    $(options.selector).html(options.searchInHtml);
    $(options.inject).append(options.searchOutHtml);
};

/**
 * 初始化滚动插件
 *
 */
// Search.prototype.initScroll = function () {
//     var me = this;
//     me._scroll = new IScroll('#search-wrap .search-page', {
//         probeType: 2,
//         scrollX: false,
//         scrollY: true,
//         scrollbars: false,
//         mouseWheel: true
//     });
// };

/**
 * 销毁滚动插件
 *
 */
// Search.prototype.destroyScroll = function () {
//     if (this._scroll) {
//         this._scroll.destroy();
//         this._scroll = null;
//     }
// };

/**
 * 销毁搜索组件
 *
 */
// Search.prototype.destroySearch = function () {
//     this.destroyScroll();
//     this.options = null;
//     this.dom = null;
// }

/**
 * 获取输入的关键字
 *
 * @return {string}, 搜索关键字
 */
Search.prototype.getKey = function () {
    return this.dom.$input.val();
};

/**
 * 获取关键字的长度
 *
 * @return {number}, 搜索关键字的长度
 */
Search.prototype.getLength = function () {
    return this.getKey().length;
};

/**
 * 判断关键字的长度是否为0
 *
 * @return {boolean}, 搜索关键字是否为空
 */
Search.prototype.isNull = function () {
    return !this.getLength();
};

/**
 * 切换元素显示与隐藏
 *
 * @param {Object} $dom, zepto对象, 需要操作的DOM节点
 * @param {boolean} show, 是否显示
 */
Search.prototype.toggle = function ($dom, show) {
    if (show) {
        $dom.removeClass('hide');
    }
    else {
        $dom.addClass('hide');
    }
};

/**
 * 切换搜索提示显示与隐藏
 *
 * @param {boolean} show, 是否显示
 */
Search.prototype.toggleTip = function (show) {
    this.toggle(this.dom.$tip, show);
};

/**
 * 切换清除按钮的显示与隐藏
 *
 * @param {boolean} show, 是否显示
 */
Search.prototype.toggleClear = function (show) {
    this.toggle(this.dom.$clear, show);
};

/**
 * 切换搜索结果展示区域的显示与隐藏
 *
 * @param {boolean} show, 是否显示
 */
Search.prototype.togglePage = function (show) {
    this.toggle(this.dom.$page, show);
};

/**
 * 切换整个搜索页的显示与隐藏
 *
 * @param {boolean} show, 是否显示
 */
Search.prototype.toggleWrap = function (show) {
    this.toggle(this.dom.$wrap, show);
};

/**
 * 清空搜索结果并隐藏结果展示区域
 *
 */
Search.prototype.clearList = function () {
    this.dom.$page.addClass('hide');
    this.dom.$content.html('');
};

/**
 * 清空搜索框并清空搜索结果和隐藏展示区域
 *
 */
Search.prototype.clearInput = function () {
    this.dom.$input.val('');
    this.clearList();
};

/**
 * 判断返回的搜索结果是否为空
 *
 * @return {boolean}, 搜索结果是否为空
 */
Search.prototype.listDataIsNull = function () {
    return !(this.listData && this.listData.length);
};

/**
 * 获取搜索结果数据
 *
 */
Search.prototype.getListData = function () {
    var data = this.data;
    var options = this.options;
    var list = options.listDir;
    var listData = [];
    if (list.length >= 1) {
        list.forEach(function (item, index) {
            listData = index !== 0 ? listData[item] : data[item];
        });
    }
    this.listData = null;
    this.listData = listData;
};

/**
 * 发送请求, 获取搜索结果
 *
 */
Search.prototype.loadList = function () {
    var me = this;

    var promise = me.page.get(me.options.url);

    promise
        .done(function (result) {
            if (result.meta.code === 200) {
                me.data = result.data;
                me.getListData();
                me.renderOutput();
            }
            else {
                me.renderNull();
            }
        })
        .fail(function (result) {
            me.renderNull();
        })
        .always(function () {
            if (me.isNull()) {
                me.isNullHandler();
            }
        });
};

/**
 * 搜索结果为空时的处理函数, 渲染为空的展示页
 *
 */
Search.prototype.renderNull = function () {
    var me = this;
    me.dom.$content.html(me.options.searchNull);
};

/**
 * 搜索结果不为空的处理函数, 渲染搜索结果列表
 *
 */
Search.prototype.renderList = function () {
    var me = this;
    var options = me.options;
    me.setResultKey();

    var selector = options.wrap + ' ' + options.content;
    view.render(selector, me.listData, {
        tmpl: options.itemTpl
    });
    // me.destroyScroll();
    // me.initScroll();
};

/**
 * 根据搜索结果来调用渲染页面的处理函数
 *
 */
Search.prototype.renderOutput = function () {
    var me = this;
    var listDataIsNull = me.listDataIsNull();

    if (listDataIsNull) {
        me.renderNull();
    }
    else {
        me.renderList();
    }
};

/**
 * 匹配搜索结果中的关键字, 为关键字添加红色的className
 *
 */
Search.prototype.setResultKey = function () {
    var me = this;
    var listData = me.listData;
    var options = me.options;
    var key = me.getKey();
    var reg = new RegExp(key, 'g');

    me.listData = listData.map(function (item) {
        item = item + '';
        return item.replace(reg, '<span class="' + options.keyClassName + '">' + key + '</span>');
    });
};

/**
 * 状态改变的处理函数
 *
 */
Search.prototype.stateChange = function () {
    var me = this;
    var isNull = me.isNull();
    if (isNull) {
        me.isNullHandler();
    }
    else {
        me.isNotNullHandler();
    }
};

/**
 * 搜索框为空的处理函数
 *
 */
Search.prototype.isNullHandler = function () {
    var me = this;
    me.toggleTip(true);
    me.toggleClear(false);
    me.clearList();
};

/**
 * 搜索框不为空的处理函数
 *
 */
Search.prototype.isNotNullHandler = function () {
    var me = this;
    me.toggleTip(false);
    me.toggleClear(true);
    me.togglePage(true);
    me.loadList();
};

/**
 * bind事件处理函数
 *
 */
Search.prototype.bindEvents = function () {
    var me = this;
    var dom = me.dom;

    dom.$searchIn.on('tap', function () {
        me.toggleWrap(true);
        dom.$input.focus();
    });

    dom.$wrap.on({
        tap: function (e) {
            var target = e.target;
            if (target === dom.$cancel[0]) {
                me.clearInput();
                me.toggleWrap(false);
            }
            else if (target === dom.$clear[0]) {
                me.clearInput();
                me.stateChange();
                dom.$input.focus();
            }
            else if (target === dom.$mask[0]) {
                me.toggleWrap(false);
            }
        },
        touchstart: function (e) {
            var target = e.target;
            if (target !== dom.$input[0] && target !== dom.$clear[0]) {
                dom.$input.blur();
                me.toggleClear(false);
            }
        }
    });

    dom.$input.on({
        input: function () {
            me.stateChange();
        },
        blur: function () {
            me.toggleClear(false);
        },
        focus: function () {
            var isNull = me.isNull();
            if (!isNull) {
                me.toggleClear(true);
            }
        }
    });
};

module.exports = Search;

