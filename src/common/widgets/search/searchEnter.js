/**
 * @file searchEnter.js
 * @author hefeng
 * 搜索组件
 *
 */

require('./searchEnter.scss');
// require('dep/touch');
// var ls = require('common/localstorage');
// var util = require('common/util');
var navigation = require('common/middleware/navigation');

/**
 * Search
 *
 * @param {Object} page 页面对象
 * @param {Object} options, 配置参数
 *      param {string} url config.api.xxx,
 *      param {number} taskId 任务id,
 *      param {string} pageType, task|talk|affair
 *      param {string} selector, 需要初始化搜索框的容器;
 *      param {string} inject, 搜索页的插入地方
 *      param {string} itemTpl, 搜索项模板
 * @param {Function} fn, 搜索页的执行逻辑
 * @constructor
 */
function Search(page, options) {

    this.opts = {
        url: '',
        role: options.role,
        selector: '',
        inject: 'body',
        itemTpl: '{{#objList}}'
                   + '<li class="item" data-id="{{id}}">'
                       + '<a href="javascript:void(0);">{{& title}}</a>'
                   + '</li>'
               + '{{/objList}}'
    };

    if (!page) {
        return;
    }
    this.timer = null;
    this.dom = {};
    this.page = page;

    $.extend(this.opts, options, {
        wrap: '#search-wrap',
        page: '.search-page',
        ul: '.search-content'

        // mainTmpl: './searchEnter.tpl'
    });

    var opts = this.opts;
    opts.lang = this.page.lang;
    // 页面上展示的搜索框
    opts.searchInHtml = '<div class="search-in"><i class="icon-search"></i>{{lang.search}}</div>';
    opts.searchNull = '<li class="no-output">'
                        + '<div class="search-icon"><i class="icon-search-big"></i></div>'
                        + '{{lang.noMatchResults}}'
                    + '</li>';
    this.loadHtml();

    $.extend(this.dom, this.getDom());
    this.dom.$page.height($(window).height() - this.dom.$page[0].offsetTop);
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
        $searchIn: $main.find('.search-in'),
        $cancel: $wrap.find('.cancel'),
        $input: $wrap.find('.search-input'),
        $tip: $wrap.find('.search-tip'),
        $clear: $wrap.find('.clear'),
        $mask: $wrap.find('.search-mask'),
        $ul: $wrap.find('.search-content'),
        $page: $wrap.find('.search-page')
    };
};

/**
 * 加载页面搜索框和搜索页面的html
 *
 */
Search.prototype.loadHtml = function () {
    var me = this;
    var opts = me.opts;

    me.page.render(opts.selector,
    {
        lang: opts.lang
    });
};

/**
 * 返回页面
 *
 */
Search.prototype.redirectHistory = function () {
    navigation.open(-1);
};

/**
 * 获取输入的关键字
 *
 * @return {string}, 搜索关键字
 */
Search.prototype.getKey = function () {
    return this.dom.$input.val().trim();
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
 * 清空搜索框
 *
 */
Search.prototype.clearInput = function () {
    this.dom.$input.val('');
};

/**
 * 清空搜索框并清空搜索结果和隐藏展示区域
 *
 */
Search.prototype.clearList = function () {
    this.dom.$ul.text('');
};

/**
 * 判断返回的搜索结果是否为空
 *
 * @param {Object} data, 搜索数据
 * @return {boolean}, 搜索结果是否为空
 */
Search.prototype.dataIsNull = function (data) {
    return !(data.objList && data.objList.length);
};

/**
 * 发送请求, 获取搜索结果
 *
 */
Search.prototype.loadList = function () {
    var me = this;
    var opts = me.opts;
    var key = me.dom.$input.val().trim();
    clearTimeout(me.timer);
    if (key === '') {
        return;
    }
    key = encodeURIComponent(key);
    var data = {
        title: key,
        role: opts.role,
        status: 0,
        page: 1,
        number: 1000
    };
    me.timer = setTimeout(function () {
        var promise = me.page.get(me.opts.url, data);
        promise
            .done(function (result) {
                if (result.meta.code === 200) {
                    me.data = result.data;
                    me.renderOutput(me.data);
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
    }, 200);
};

/**
 * 搜索结果为空时的处理函数, 渲染为空的展示页
 *
 */
Search.prototype.renderNull = function () {
    var me = this;
    var opts = me.opts;
    me.page.render(me.opts.ul,
    {
        lang: opts.lang
    },
    {
        tmpl: opts.searchNull
    });
};

/**
 * 搜索结果不为空的处理函数, 渲染搜索结果列表
 *
 * @param {Object} data, 搜索数据
 * @param {string} append, 添加dom 节点的方式
 */
Search.prototype.renderList = function (data) {
    var me = this;
    var opts = me.opts;
    me.setResultKey(data);
    var $ul = me.dom.$ul;

    var str = me.page.render(null, data, {
        tmpl: opts.itemTpl
    });

    $ul.html(str);
};

/**
 * 根据搜索结果来调用渲染页面的处理函数
 *
 * @param {Object} data, 搜索数据
 */
Search.prototype.renderOutput = function (data) {
    var me = this;
    var dataIsNull = me.dataIsNull(data);

    if (dataIsNull) {
        me.renderNull();
    }
    else {
        $('.no-output').remove();
        me.renderList(data);
    }
};

/**
 * 匹配搜索结果中的关键字, 为关键字添加红色的className
 *
 * @param {Object} data, 搜索数据
 */
Search.prototype.setResultKey = function (data) {
    var me = this;
    var key = me.getKey();
    if (key.indexOf('$') > -1) {
        key = key.replace('$', '\\$');
    }
    else if (key.indexOf('^') > -1) {
        key = key.replace('^', '\\^');
    }
    else if (key.indexOf('*') > -1) {
        key = key.replace('*', '\\*');
    }
    else if (key.indexOf('.') > -1) {
        key = key.replace('.', '\\.');
    }
    else if (key.indexOf('?') > -1) {
        key = key.replace('?', '\\?');
    }
    else if (key.indexOf(')') > -1) {
        key = key.replace(')', '\\)');
    }
    else if (key.indexOf('(') > -1) {
        key = key.replace('(', '\\(');
    }
    else if (key.indexOf('|') > -1) {
        key = key.replace('|', '\\|');
    }
    else if (key.indexOf('\\') > -1) {
        key = key.replace('\\', '\\\\');
    }
    if (key === '<') {
        key = '&lt;';
    }
    if (key === '>') {
        key = '&gt;';
    }
    var reg = new RegExp(key, 'gi');

    data.objList.forEach(function (item) {
        item.title = item.title.replace(new RegExp(/</g), '&lt;').replace(new RegExp(/>/g), '&gt;');
        item.title = item.title.replace(reg, '<span class="input-key">' + reg.exec(item.title) + '</span>');
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
    me.clearList();
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
 * @param {Function} callback, 搜索页面的回调函数
 */
Search.prototype.bindEvents = function () {
    var me = this;
    var opts = me.opts;
    var dom = me.dom;

    dom.$cancel.on('click', function () {
        me.redirectHistory();
        me.stateChange();
    });
    dom.$clear.on('click', function () {
        me.clearInput();
        dom.$input.focus();
        me.stateChange();
    });
    dom.$input.on(
    {
        input: function () {
            me.stateChange();
            me.loadList();
        },
        focus: function () {
            me.toggleClear(true);
        }
    });

    $(opts.wrap + ' .search-content').off('click').on('click', 'li.item', function (e) {
        var id = +$(this).data('id');
        var url = '/task-detail.html?taskId=' + id + '&role=' + opts.role;
        navigation.open(url, {
            title: opts.lang.taskDetail
        });
    });
};

module.exports = Search;
