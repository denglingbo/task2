/**
 * @file search.js
 * @author hefeng
 * 搜索页
 *
 */
require('./search.scss');
require('dep/touch');
var config = require('config');
var Page = require('common/page');
var lang = require('common/lang').getData();
var view = require('common/view');
var util = require('common/util');

var page = new Page({
    pageName: 'search-search'
});

var search = {
    // 存放一些参数
    options: {
        searchNull: '<li class="no-output"><i class="icon-search-big"></i>暂无匹配结果</div>',
        searchList: '{{#.}}<li class="item"><a href="javascript:void(0);">{{& .}}</a></li>{{/.}}',
        keyClassName: 'input-key',
        content: '.search-content'
    },
    // 存放dom节点
    dom: {},

    /**
     * 获取输入的关键字
     *
     * @return {string}, 搜索关键字
     */
    getKey: function () {
        return this.dom.$input.val();
    },

    /**
     * 获取关键字的长度
     *
     * @return {number}, 搜索关键字的长度
     */
    getLength: function () {
        return this.getKey().length;
    },

    /**
     * 判断关键字的长度是否为0
     *
     * @return {boolean}, 搜索关键字是否为空
     */
    isNull: function () {
        return !this.getLength();
    },

    /**
     * 切换元素显示与隐藏
     *
     * @param {Object} $dom, zepto对象, 需要操作的DOM节点
     * @param {boolean} show, 是否显示
     */
    toggle: function ($dom, show) {
        if (show) {
            $dom.removeClass('hide');
        }
        else {
            $dom.addClass('hide');
        }
    },

    /**
     * 切换搜索提示显示与隐藏
     *
     * @param {boolean} show, 是否显示
     */
    toggleTip: function (show) {
        this.toggle(this.dom.$tip, show);
    },

    /**
     * 切换清除按钮的显示与隐藏
     *
     * @param {boolean} show, 是否显示
     */
    toggleClear: function (show) {
        this.toggle(this.dom.$clear, show);
    },

    /**
     * 清空搜索结果并隐藏结果展示区域
     *
     */
    clearList: function () {
        this.dom.$content.html('');
    },

    /**
     * 清空搜索框并清空搜索结果和隐藏展示区域
     *
     */
    clearInput: function () {
        this.dom.$input.val('');
    },

    /**
     * 判断返回的搜索结果是否为空
     *
     * @return {boolean}, 搜索结果是否为空
     */
    listDataIsNull: function () {
        return !(this.listData && this.listData.length);
    },

    /**
     * 发送请求, 获取搜索结果
     *
     */
    loadList: function () {
        var me = this;
        var key = me.dom.$input.val();
        var promise = page.get(config.API.SEARCH, {key: key});

        promise
            .done(function (result) {
                if (result.meta.code === 200) {
                    page.data = result.data;
                    me.listData = page.data.list;
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
    },

    /**
     * 搜索结果为空时的处理函数, 渲染为空的展示页
     *
     */
    renderNull: function () {
        var me = this;
        me.dom.$content.html(me.options.searchNull);
    },

    /**
     * 搜索结果不为空的处理函数, 渲染搜索结果列表
     *
     */
    renderList: function () {
        var me = this;
        me.setResultKey();
        var options = me.options;
        view.render(options.content, me.listData, {
            tmpl: options.searchList
        });
    },

    /**
     * 根据搜索结果来调用渲染页面的处理函数
     *
     */
    renderOutput: function () {
        var me = this;
        var listDataIsNull = me.listDataIsNull();

        if (listDataIsNull) {
            me.renderNull();
        }
        else {
            me.renderList();
        }
    },

    /**
     * 匹配搜索结果中的关键字, 为关键字添加红色的className
     *
     */
    setResultKey: function () {
        var me = this;
        var listData = me.listData;
        var options = me.options;
        var key = me.getKey();
        var reg = new RegExp(key, 'g');

        me.listData = listData.map(function (item) {
            item = item + '';
            return item.replace(reg, '<span class="' + options.keyClassName + '">' + key + '</span>');
        });
    },

    /**
     * 状态改变的处理函数
     *
     */
    stateChange: function () {
        var me = this;
        var isNull = me.isNull();
        if (isNull) {
            me.isNullHandler();
        }
        else {
            me.isNotNullHandler();
        }
    },

    /**
     * 搜索框为空的处理函数
     *
     */
    isNullHandler: function () {
        var me = this;
        me.toggleTip(true);
        me.toggleClear(false);
        // me.clearList();
    },

    /**
     * 搜索框不为空的处理函数
     *
     */
    isNotNullHandler: function () {
        var me = this;
        me.toggleTip(false);
        me.toggleClear(true);
        // me.loadList();
    },

    /**
     * 返回页面
     *
     * @param {string} url, 返回的url
     */
    redirect: function (url) {
        /* eslint-disable */
        CPNavigationBar.redirect(url);
        /* eslint-enable */
    }
};


page.enter = function () {
    var me = this;
    me.render('#search', {search: lang.search});
    me.getDom();
    me.bindEvents();

    var key = decodeURI(util.params('key'));
    search.dom.$input.val(key);
    search.stateChange();
    search.loadList();
};

page.getDom = function () {
    var $wrap = $('#search-wrap');
    search.dom = {
        $cancel: $wrap.find('.cancel'),
        $input: $wrap.find('.search-input'),
        $tip: $wrap.find('.search-tip'),
        $clear: $wrap.find('.clear'),
        $content: $wrap.find('.search-content')
    };
};
page.bindEvents = function () {
    var dom = search.dom;
    $('#search-wrap').on({
        tap: function (e) {
            var target = e.target;
            if (target === dom.$cancel[0]) {
                search.redirect('');
            }
            else if (target === dom.$clear[0]) {
                dom.$input.val('');
                search.toggleClear(false);
                dom.$input.focus();
            }
        },
        touchstart: function (e) {
            var target = e.target;
            if (target !== dom.$input[0] && target !== dom.$clear[0]) {
                dom.$input.blur();
                search.toggleClear(false);
            }
        }
    });

    dom.$input.on({
        input: function () {
            search.stateChange();
        },
        blur: function () {
            search.toggleClear(false);
        },
        focus: function () {
            if (search.getLength()) {
                search.toggleClear(true);
            }
        }
    });

    $(document).on('keyup', function (e) {
        if (e.keyCode === 13) {
            search.loadList();
        }
    });
};

$(function () {
    page.start();
});
