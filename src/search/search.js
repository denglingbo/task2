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

var key = '';

var searchPage = {
    task: function () {
        return {
            detailUrl: './task-detail.html',
            list: config.API.GET_TASK_LIST,
            page: 'task'
        };
    },
    talk: function () {
        return {
            detailUrl: './talk-detail.html',
            list: config.API.GET_TALK_LIST,
            page: 'talk',
            taskId: util.params('task_id')
        };
    },
    affair: function () {
        return {
            detailUrl: './affair-detail.html',
            list: config.API.GET_AFFAIR_LIST,
            page: 'affair',
            taskId: util.params('task_id')
        };
    }
};

page.enter = function () {

};

/**
 * 匹配搜索结果中的关键字, 为关键字添加红色的className
 *
 * @param {Object} data, 待处理的搜索数据
 */
function setResultKey(data) {
    var value = key;
    var reg = new RegExp(value);

    data.obj_list.forEach(function (item) {
        item.title = item.title.replace(reg, '<span class="input-key">' + value + '</span>');
    });
}

/**
 * 搜索结果不为空的处理函数, 渲染搜索结果列表
 *
 */
page.renderList = function () {
    var me = this;
    setResultKey(me.data);
    me.render('.search-content', me.data.obj_list, {
        tmpl: '{{#.}}<li class="item" data-id="{{id}}" data-taskId="{{task_id}}">'
            + '<a href="javascript:void(0);">{{& title}}</a>'
            + '</li>{{/.}}'
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
    var dataIsNull = !me.data.obj_list.length;

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
 * @param {string} value, 搜索关键字
 */
page.loadList = function (value) {
    if (value === '') {
        return;
    }

    var me = this;
    var data = {
        title: value,
        /* eslint-disable */
        curr_page: 1,
        /* eslint-enable */
        number: 15
    };
    /* eslint-disable */
    me.api.taskId && (data.task_id = me.api.taskId);
    /* eslint-enable */
    var promise = me.get(me.api.list, data);

    promise
        .done(function (result) {
            if (result.meta.code === 200) {
                me.data = result.data;
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

page.deviceready  = function () {
    var me = this;

    new Search(me, {
        isSearchPage: true,
        selector: '#search'
    },
    function () {
        var that = this;
        var page = util.params('page');

        me.api = page ? searchPage[page]() : '';
        key = util.params('key');
        key = key ? decodeURIComponent(key) : '';
        that.dom.$input.val(key);
        that.stateChange();
        me.loadList(key);

        that.bindEvents(function () {

            $(document).on('keyup', function (e) {
                if (e.keyCode === 13) {
                    key = that.getKey();
                    me.loadList(key);
                }
            });
        });
    });

    $('#search').on('click', 'li', function (e) {
        var id = $(this).attr('data-id');
        var parentId = $(this).attr('data-taskId');
        var query;
        switch (me.api.page) {
            case 'task':
                query = '?task_id=' + id;
                break;
            case 'talk':
                query = '?task_id=' + parentId + '&id=' + id;
                break;
            case 'affair':
                query = '?task_id=' + parentId + '&id=' + id;
                break;
        }
        /* eslint-disable */
        CPNavigationBar.redirect(me.api.detailUrl + query);
        /* eslint-enable */

    });
};

$(function () {
    page.start();
});
