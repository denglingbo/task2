/**
 * @file searchPlugin.js
 * @author hefeng
 * 搜索组件
 *
 */

require('./searchEnter.scss');
// require('dep/touch');
var ls = require('common/localstorage');
var util = require('common/util');

/**
 * Search
 *
 * @param {Object} page 页面对象
 * @param {Object} options, 配置参数
 *      param {boolean} isSearchPage 搜索页面为true
 *      param {string} selector, 需要初始化搜索框的容器;
 *      param {string} inject, 搜索页的插入地方
 *      param {string} page, task|talk|affair
 * @param {Function} fn, 搜索页的执行逻辑
 * @constructor
 */
function Search(page, options, fn) {

    this.opts = {
        isSearchPage: false,
        selector: '',
        inject: 'body',
        page: ''
    };

    if (!page) {
        return;
    }
    this.dom = {};
    this.page = page;

    $.extend(this.opts, options, {
        wrap: '#search-wrap',
        content: '.search-content',
        mainTmpl: './searchEnter.tpl'
    });

    var opts = this.opts;
    opts.lang = this.page.lang;
    // 页面上展示的搜索框
    opts.searchInHtml = '<div class="search-in"><i class="icon-search"></i>{{lang.search}}</div>';

    this.loadHtml();

    $.extend(this.dom, this.getDom());

    if (opts.isSearchPage && fn) {
        fn.call(this, null);
        // this.initSearchPage();
    }
    else {
        this.bindEvents();
    }
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

    var tmpl = require(opts.mainTmpl);
    if (opts.isSearchPage) {
        me.page.render(opts.selector,
        {
            lang: me.page.lang,
            isSearchPage: opts.isSearchPage
        },
        {
            tmpl: tmpl
        });
    }
    else {
        $(opts.selector).addClass('search-box');

        me.page.render(opts.selector,
        {
            lang: me.page.lang
        },
        {
            tmpl: opts.searchInHtml
        });

        me.page.render(opts.inject,
        {
            lang: me.page.lang,
            isSearchPage: opts.isSearchPage
        },
        {
            tmpl: tmpl,
            type: 'append'
        });
    }
};

// /**
//  * 初始化搜索页
//  *
//  *
//  */
// Search.prototype.initSearchPage = function () {
//     var me = this;
//     var key = util.params('key');
//     key = key ? decodeURI(key) : '';
//     me.dom.$input.val(key);
//     me.stateChange();
//     me.loadList();
// };

/**
 * 进入搜索页
 *
 *
 */
Search.prototype.redirectSearch = function () {
    var opts = this.opts;
    var href = location.href;
    ls.addData('history', href);
    var taskId = util.params('task_id');
    /* eslint-disable */
    var query = taskId ? '&task_id=' + query : '';
    CPNavigationBar.redirect('/search-search.html?key=' 
        + encodeURIComponent(this.dom.$input.val()) 
        + '&page=' + opts.page + query, opts.search);
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
// Search.prototype.dataIsNull = function () {
//     return !(this.data && this.data.length);
// };

/**
 * 发送请求, 获取搜索结果
 *
 */
// Search.prototype.loadList = function () {
//     var me = this;
//     var key = me.dom.$input.val();

//     var promise = me.page.get(me.opts.url, {key: key});

//     promise
//         .done(function (result) {
//             if (result.meta.code === 200) {
//                 me.data = result.data[me.opts.dataKey];
//                 me.renderOutput();
//             }
//             else {
//                 me.renderNull();
//             }
//         })
//         .fail(function (result) {
//             me.renderNull();
//         })
//         .always(function () {
//             if (me.isNull()) {
//                 me.isNullHandler();
//             }
//         });
// };

/**
 * 搜索结果为空时的处理函数, 渲染为空的展示页
 *
 */
// Search.prototype.renderNull = function () {
//     var me = this;
//     me.page.render(me.opts.content,
//     {
//         lang: me.page.lang
//     },
//     {
//         tmpl: me.opts.searchNull
//     });
// };

/**
 * 搜索结果不为空的处理函数, 渲染搜索结果列表
 *
 */
// Search.prototype.renderList = function () {
//     var me = this;
//     var opts = me.opts;
//     me.setResultKey();

//     var selector = opts.wrap + ' ' + opts.content;
//     me.page.render(selector, me.data, {
//         tmpl: opts.itemTpl
//     });
// };

/**
 * 根据搜索结果来调用渲染页面的处理函数
 *
 */
// Search.prototype.renderOutput = function () {
//     var me = this;
//     var dataIsNull = me.dataIsNull();

//     if (dataIsNull) {
//         me.renderNull();
//     }
//     else {
//         me.renderList();
//     }
// };

/**
 * 匹配搜索结果中的关键字, 为关键字添加红色的className
 *
 */
// Search.prototype.setResultKey = function () {
//     var me = this;
//     var data = me.data;
//     var opts = me.opts;
//     var key = me.getKey();
//     var reg = new RegExp(key, 'g');

//     me.data = data.map(function (item) {
//         item = item + '';
//         return item.replace(reg, '<span class="' + opts.keyClassName + '">' + key + '</span>');
//     });
// };

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
 * @param {Function} callback, 搜索页面的回调函数
 */
Search.prototype.bindEvents = function (callback) {
    var me = this;
    var opts = me.opts;
    var dom = me.dom;
    if (!opts.isSearchPage) {
        dom.$searchIn.on('click', function () {
            me.toggleWrap(true);
            dom.$input.focus();
        });

        $(document).on('keyup', function (e) {
            if (e.keyCode === 13) {
                me.redirectSearch();
            }
        });
    }

    dom.$wrap.on('click', function (e) {
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

    if (callback) {
        callback();
    }
};

module.exports = Search;
