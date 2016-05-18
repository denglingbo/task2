/**
 * @file search.js
 * @author hefeng
 * 搜索页
 *
 */

require('dep/touch');
var config = require('config');
var util = require('common/util');
var Page = require('common/page');
var Search = require('common/widgets/search/searchEnter');

var page = new Page({
    pageName: 'search-search'
});

page.enter = function () {
    var me = this;

    new Search(me, {
        isSearchPage: true,
        selector: '#search'
    },
    function () {
        var that = this;
        var key = util.params('key');
        key = key ? decodeURIComponent(key) : '';
        that.dom.$input.val(key);
        that.stateChange();
        me.loadList(key);

        that.bindEvents(function () {

            $(document).on('keyup', function (e) {
                var key = '';
                if (e.keyCode === 13) {
                    key = that.getKey();
                    me.loadList(key);
                }
            });
        });

    });
};

/**
 * 匹配搜索结果中的关键字, 为关键字添加红色的className
 *
 * @param {Object} data, 待处理的搜索数据
 * @return {Object}, 处理了的搜索数据
 */
function setResultKey(data) {
    var key = $('#search-input').val();
    var reg = new RegExp(key, 'g');

    var listData = data.map(function (item) {
        item = item + '';
        return item.replace(reg, '<span class="input-key">' + key + '</span>');
    });
    return listData;
}

/**
 * 搜索结果不为空的处理函数, 渲染搜索结果列表
 *
 */
page.renderList = function () {
    var me = this;
    var listData = setResultKey(me.data);
    me.render('.search-content', listData, {
        tmpl: '{{#.}}<li class="item"><a href="javascript:void(0);">{{& .}}</a></li>{{/.}}'
    });
};

/**
 * 搜索结果为空时的处理函数, 渲染为空的展示页
 *
 */
page.renderNull = function () {
    var me = this;
    me.render('.search-content',
    {
        lang: me.lang
    },
    {
        tmpl: '<li class="no-output"><i class="icon-search-big"></i>{{lang.noMatchResults}}</li>'
    });
};

/**
 * 根据搜索结果来调用渲染页面的处理函数
 *
 */
page.renderOutput = function () {
    var me = this;
    var dataIsNull = !me.data.length;

    if (dataIsNull) {
        me.renderNull();
    }
    else {
        me.renderList();
    }
};

/**
 * 发送请求, 获取搜索结果
 *
 * @param {string} key, 搜索关键字
 */
page.loadList = function (key) {
    var me = this;

    var promise = me.get(config.API.SEARCH, {key: key});

    promise
        .done(function (result) {
            if (result.meta.code === 200) {
                me.data = result.data.list;
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
            if (!$('#search-input').val().length) {
                $('.search-tip').removeClass('hide');
            }
        });
};

$(function () {
    page.start();
});
