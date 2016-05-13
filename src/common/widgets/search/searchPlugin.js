/**
 * @file searchPlugin.js
 * @author hefeng
 * 搜索组件
 *
 */

/* eslint-disable */
require('./searchPlugin.scss');
var view = require('common/ui/view');
var IScroll = require('dep/iscroll');

function Search(selector) {
    this.options = {
        selector: selector,
        inject: 'body',
        wrap: '#search-wrap',
        page: '.search-page'
    };
    var options = this.options;
    options.searchIn = '<div class="search-in"><i class="icon-search"></i>搜索</div>';
    options.searchOut = '<div id="search-wrap" class="search-wrap hide">'
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
    this.dom = {
        $main: $(this.options.selector)
    }

    this.loadHtml();

    var dom = this.dom;

    dom.$wrap = $(options.wrap);

    var $wrap = dom.$wrap;
    var $main = dom.$main;

    var newDom = {
        $searchIn: $main.find('.search-in'),
        $cancel: $wrap.find('.cancel'),
        $input: $wrap.find('.search-input'),
        $tip: $wrap.find('.search-tip'),
        $clear: $wrap.find('.clear'),
        $page: $wrap.find('.search-page'),
        $content: $wrap.find('.search-content'),
        $mask: $wrap.find('.search-mask')
    };

    $.extend(dom, newDom);
    this.bindEvents();
};

Search.prototype.loadHtml = function () {
    var me = this;
    var options = me.options;
    var dom = me.dom;

    dom.$main.addClass('search-box');
    dom.$main.html(options.searchIn);
    $(options.inject).append(options.searchOut);
};

Search.prototype.initScroll = function () {
    var me = this;
    me._scroll = new IScroll('#search-wrap .search-page', {
        probeType: 2,
        scrollX: false,
        scrollY: true,
        scrollbars: false,
        mouseWheel: true
    });
};

Search.prototype.destroyScroll = function () {
    if (this._scroll) {
        this._scroll.destroy();
        this._scroll = null;
    }
};

Search.prototype.getVal = function () {
    return this.dom.$input.val();
};

Search.prototype.getLength = function () {
    return this.getVal().length;
};

Search.prototype.isNull = function () {
    return !!!this.getLength();
};

Search.prototype.isNotNull = function () {
    return !!this.getLength();
};

Search.prototype.toggle = function ($dom, show) {
    if (show) {
        $dom.removeClass('hide');
    }
    else {
        $dom.addClass('hide');
    }
};

Search.prototype.toggleTip = function (show) {
    this.toggle(this.dom.$tip, show);
};

Search.prototype.toggleClear = function (show) {
    this.toggle(this.dom.$clear, show);
};

Search.prototype.togglePage = function (show) {
    this.toggle(this.dom.$page, show);
};

Search.prototype.toggleWrap = function (show) {
    this.toggle(this.dom.$wrap, show);
}

Search.prototype.stateChange = function () {
    var isNull = this.isNull();
    var isNotNull = this.isNotNull();
    var me = this;
    if (isNull) {
        me.toggleTip(true);
        me.toggleClear(false);
        me.clearList();
    }
    else {
        me.toggleTip(false);
        me.toggleClear(true);
    }
};

Search.prototype.render = function (selector, data, options) {
    var str = view.render(selector, data, options);
    return str;
};

Search.prototype.clearList = function () {
    this.dom.$page.addClass('hide');
    this.dom.$content.html('');
};

Search.prototype.clearInput = function () {
    this.dom.$input.val('');
    this.clearList();
}

Search.prototype.loadList = function () {
    var me = this;
    me.data = {
        list: [
            Math.random(),
            Math.random(),
            Math.random(),
            Math.random(),
            Math.random(),
            Math.random(),
            Math.random(),
            Math.random(),
            Math.random(),
            Math.random(),
            Math.random(),
            Math.random(),
            Math.random(),
            Math.random(),
            Math.random(),
            Math.random(),
            Math.random(),
            Math.random(),
            Math.random(),
            Math.random(),
            Math.random(),
            Math.random(),
            Math.random(),
            Math.random(),
            Math.random(),
            Math.random(),
            Math.random(),
            Math.random(),
            Math.random(),
            Math.random(),
            Math.random(),
            Math.random(),
            Math.random(),
            Math.random()
        ]
    }
    me.renderList();
};

Search.prototype.renderList = function () {
    var me = this;
    me.render('#search-wrap .search-content', me.data, {
        tmpl: '{{#list}}<li class="item">{{.}}</li>{{/list}}'
    });
    me.togglePage(true);
    me.initScroll();
};

Search.prototype.bindEvents = function () {
    var me = this;
    var options = me.options;
    var dom = me.dom;

    dom.$searchIn.on('click', function () {
        me.toggleWrap(true);
        dom.$input.focus();
    });

    dom.$wrap.on('click', function (e) {
        var target = e.target;
        if (target === dom.$cancel[0]) {
            me.clearInput();
            me.toggleWrap(false);
        }
        else if (target === dom.$clear[0]) {
            me.clearInput();
            me.stateChange();
        }
    });

    dom.$mask.on('click', function () {
        me.toggleWrap(false);
    });

    dom.$input.on({
        'input': function () {
            me.stateChange();
            me.loadList();
        },
        // 'blur': function (e) {
        //     me.toggleClear(false);
        // },
        'focus': function() {
            me.toggleClear(true);
            me.stateChange();
        }
    });
};

module.exports = Search;
/* eslint-enable */
