/**
 * @file list.js
 * @author deo
 * 任务列表页
 *
 */

require('./list.scss');

var config = require('../config');
var util = require('common/util');
var Page = require('common/page');
// var Sticky = require('../common/ui/sticky');
var PageSlider = require('common/ui/pageSlider');
var InitScroll = require('./list/initScroll');
var Search = require('common/widgets/search/searchEnter');

var raw = require('common/widgets/raw');

var page = new Page();

var pages = [
    {
        name: 'doing',
        selector: '#list-wrapper-doing',
        index: 0,
        api: config.API.GET_TASK_LIST,
        current: true
    },
    {
        name: 'done',
        selector: '#list-wrapper-done',
        api: config.API.LIST_DONE_URL,
        index: 1
    },
    {
        name: 'cancel',
        selector: '#list-wrapper-cancel',
        api: config.API.LIST_CANCEL_URL,
        index: 2
    }
];

// 所有 tab 页面的对象
var pageCache = {};

page.enter = function () {
    var me = this;
    // new Sticky({target: selector, top: 0});
    me.render('#main', me.data);
    me.render('#fixbar', me.data);

    this.initSlider();

    this.bindEvents();

    new Search(this, {
        selector: '#search',
        pageType: 'task',
        url: config.API.GET_TASK_LIST
    });
};

page.deviceready = function () {
    var me = this;
    var lang = me.lang;
    /* eslint-disable */
    CPNavigationBar.setRightButton('xxx', [{
        title: '+',
        iconPath: '',
        callback: function() {
            
        }
    }]);
    CPNavigationBar.setLeftButton({
        title : lang.back,
        iconPath : '',
        callback : function () {
            CPNavigationBar.returnPreviousPage();
        }
    });
    /* eslint-enable */
};

page.bindEvents = function () {

};

/**
 * 初始化配置 滑动切换页面 函数
 *
 */
page.initSlider = function () {
    var me = this;

    new PageSlider({
        outer: '.slider-outer',
        tabs: '.tab-page li',
        pages: pages,

        onInit: function (info) {
            me.loadPage(info, me.data);
        },

        onSlide: function (info) {

            if (info && info.name && !pageCache[info.name]) {

                me.get(info.api)
                    .done(function (result) {
                        me.loadPage(info, result.data);
                    })
                    .fail(function () {
                        // Do something
                        var $content = $(info.selector).find('.list-wrapper-content');
                        me.failed($content);
                    });
            }
        }
    });
};

/**
 * 加载页面
 *
 * @param {Object} info, 当前展示的页面配置
 * @param {Object} data, 当前要渲染的模板数据
 *
 */
page.loadPage = function (info, data) {
    var me = this;
    require.ensure(['./list/item'], function () {

        var template = require('./list/item');
        var $content = $(info.selector).find('.list-wrapper-content');
        me.render($content, data, {
            tmpl: template
        });
        pageCache[info.name] = 1;

        // 为了 IScroll 一定能被绑定正确，需要添加一个 timeout
        setTimeout(function () {
            new InitScroll(me, info, 86);
        }, 0);
    });
};

/**
 * 请求页面接口
 *
 * @param {deferred} dfd, deferred
 *
 */
page.addParallelTask(function (dfd) {
    var me = this;
    var promise = page.get(config.API.GET_TASK_LIST, {});

    promise
        .done(function (result) {
            if (result.meta && result.meta.code !== 200) {
                dfd.reject(result);
            }
            else {
                var data = result.data;

                // 时间展示
                data.updateDateRaw = function () {
                    return util.formatDateToNow(this.op_time);
                };
                data.statusRaw = function () {
                    return raw.status(this.status);
                };
                data.importanceRaw = function () {
                    raw.importance(this.importance_level);
                };

                me.data = data;

                dfd.resolve();
            }
        });
});

$(function () {
    page.start();
});
