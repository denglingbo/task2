/**
 * @file searchPlugin.js
 * @author hefeng
 * 搜索组件
 *
 */

require('./searchPage.scss');
require('dep/touch');
var lang = require('common/lang').getData();
var ls = require('common/localstorage');
var util = require('common/util');
var Mustache = require('dep/mustache');

/**
 * Search
 *
 * @param {Object} page 页面对象
 * @param {Object} options, 配置参数
 *      @param {Object} url config.API配置的请求
 *      @param {string} selector, 需要初始化搜索框的容器;
 *      @param {string} listDir, 搜索结果中结果列表的目录层次, 到数组一级
 *      @param {string} inject, 搜索页的插入地方
 *      @param {string} keyClassName, 搜索结果中关键字的显示样式
 *      @param {string} itemTpl, 搜索结果的Mustache渲染模板
 * @constructor
 */
function Search(page, options) {

    this.opts = {
        isSearchPage: false,
        selector: '',
        listDir: '',
        keyClassName: 'input-key',
        url: '',
        itemTpl: '{{#.}}<li class="item"><a href="javascript:void(0);">{{& .}}</a></li>{{/.}}',
        inject: 'body'
    };

    if (!page) {
        return;
    }
    this.dom = {};
    this.page = page;

    $.extend(this.opts, options, {
        wrap: '#search-wrap',
        content: '.search-content',
        search: lang.search,
        noMatchResults: lang.noMatchResults
    });

    var opts = this.opts;

    // 页面上展示的搜索框
    opts.searchInHtml = '<div class="search-in"><i class="icon-search"></i>{{search}}</div>';

    this.loadHtml();

    $.extend(this.dom, this.getDom());

    if (this.opts.isSearchPage) {
        // 无搜索结果页面
        opts.searchNull = '<li class="no-output"><i class="icon-search-big"></i>{{noMatchResults}}</div>';

        opts.listDirArr = opts.listDir.length
                    && (typeof this.opts.listDir === 'string')
                    && this.opts.listDir.replace(/^\s*\/|\/\s*$/g, '').split('/');

        this.initSearchPage();
    }

    this.bindEvents();
}

/**
 * 获取DOM元素
 *
 * @return {Object}, 获取的DOM
 */
Search.prototype.getDom = function () {
    var dom = this.dom;
    var opts = this.opts;
    var $wrap = dom.$wrap = $(opts.wrap);
    var $main = dom.$main = $(opts.selector);

    return {
        $searchIn: opts.isSearchPage ? null : $main.find('.search-in'),
        $cancel: $wrap.find('.cancel'),
        $input: $wrap.find('.search-input'),
        $tip: $wrap.find('.search-tip'),
        $clear: $wrap.find('.clear'),
        $mask: opts.isSearchPage ? null : $wrap.find('.search-mask'),
        $content: $wrap.find('.search-content')
    };
};

/**
 * 加载页面搜索框和搜索页面的html
 *
 */
Search.prototype.loadHtml = function () {
    var me = this;
    var opts = me.opts;

    var tmpl = require('./searchPage.tpl');
    if (opts.isSearchPage) {
        me.page.render('#search',
        {
            search: lang.search,
            isSearchPage: opts.isSearchPage
        },
        {
            tmpl: tmpl
        });
    }
    else {
        $(opts.selector).addClass('search-box');

        var searchIn = Mustache.render(opts.searchInHtml, {
            search: lang.search
        });
        $(opts.selector).html(searchIn);

        tmpl = Mustache.render(tmpl, {
            search: lang.search,
            isSearchPage: opts.isSearchPage
        });
        $(opts.inject).append(tmpl);
    }
};

/**
 * 初始化搜索页
 *
 *
 */
Search.prototype.initSearchPage = function () {
    var me = this;
    var key = util.params('key');
    key = key ? decodeURI(key) : '';
    me.dom.$input.val(key);
    me.stateChange();
    me.loadList();
};

/**
 * 进入搜索页
 *
 *
 */
Search.prototype.redirectSearch = function () {
    var href = location.href;
    ls.addData('history', href);
    /* eslint-disable */
    CPNavigationBar.redirect('/search/search.html?key=' + encodeURI(this.dom.$input.val()), '搜索');
    /* eslint-enable */
};

/**
 * 返回页面
 *
 */
Search.prototype.redirectHistory = function () {
    /* eslint-disable */
    CPNavigationBar.redirect(ls.getData('history'));
    /* eslint-enable */
};

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
 * 切换整个搜索页的显示与隐藏
 *
 * @param {boolean} show, 是否显示
 */
Search.prototype.toggleWrap = function (show) {
    this.toggle(this.dom.$wrap, show);
};

/**
 * 清空搜索框并清空搜索结果和隐藏展示区域
 *
 */
Search.prototype.clearInput = function () {
    this.dom.$input.val('');
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
    var opts = this.opts;
    var list = opts.listDirArr;
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
    var key = me.dom.$input.val();

    var promise = me.page.get(me.opts.url, {key: key});

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
    me.page.render(me.opts.content,
    {
        noMatchResults: lang.noMatchResults
    },
    {
        tmpl: me.opts.searchNull
    });
};

/**
 * 搜索结果不为空的处理函数, 渲染搜索结果列表
 *
 */
Search.prototype.renderList = function () {
    var me = this;
    var opts = me.opts;
    me.setResultKey();

    var selector = opts.wrap + ' ' + opts.content;
    me.page.render(selector, me.listData, {
        tmpl: opts.itemTpl
    });
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
    var opts = me.opts;
    var key = me.getKey();
    var reg = new RegExp(key, 'g');

    me.listData = listData.map(function (item) {
        item = item + '';
        return item.replace(reg, '<span class="' + opts.keyClassName + '">' + key + '</span>');
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
};

/**
 * 搜索框不为空的处理函数
 *
 */
Search.prototype.isNotNullHandler = function () {
    var me = this;
    me.toggleTip(false);
};

/**
 * bind事件处理函数
 *
 */
Search.prototype.bindEvents = function () {
    var me = this;
    var opts = me.opts;
    var dom = me.dom;
    if (!opts.isSearchPage) {
        dom.$searchIn.on('tap', function () {
            me.toggleWrap(true);
            dom.$input.focus();
        });
    }

    dom.$wrap.on('tap', function (e) {
        var target = e.target;
        if (target === dom.$clear[0]) {
            me.clearInput();
            dom.$input.focus();
        }
        if (opts.isSearchPage) {
            if (target === dom.$cancel[0]) {
                me.redirectHistory();
            }
        }
        else {
            if (target === dom.$cancel[0]) {
                me.clearInput();
                me.toggleWrap(false);
            }
            else if (target === dom.$mask[0]) {
                me.clearInput();
                me.toggleWrap(false);
            }
        }

        me.stateChange();
    });

    dom.$input.on(
    {
        input: function () {
            me.stateChange();
        },
        blur: function () {
            me.toggleClear(false);
        },
        focus: function () {
            me.toggleClear(true);
        }
    });

    $(document).on('keyup', function (e) {
        if (e.keyCode === 13) {
            if (!opts.isSearchPage) {
                me.redirectSearch();
            }
            else {
                me.loadList();
            }
        }
    });
};

module.exports = Search;
