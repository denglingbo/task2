/**
 * @file list.js
 * @author deo
 * 任务列表页
 *
 */

require('./list.scss');
require('common/widgets/search/searchEnter.scss');
require('common/widgets/emptyPage/emptyTask.scss');

var Page = require('common/page');
var page = new Page();

var config = require('../config');
var util = require('common/util');
var navigation = require('common/middleware/navigation');
// var Sticky = require('common/ui/sticky');
var Pharos = require('common/ui/pharos');

// 初始化 单页
var InitPage = require('./list/initPage');
// 初始化多页切换
var PageSlider = require('./list/pageSlider');
var pageTpl = require('./list/page');
var IScroll = require('dep/iscroll');

var listTpl = require('./list/item');

var emptyTaskTpl = require('common/widgets/emptyPage/emptyTask');

/**
 * role id
 * 1: 我派发的
 * 2: 我负责的
 * 3: 我参与的
 */
var rid = util.getParam('rid');

var Localdb = require('common/ui/localdb');
var coll = new Localdb(config.const.DATABASE_NAME, 'LIST');


/**
 * 缓存请求的 tab 页面数据
 */
var pageCache = {};

var pages = require('./list/config');

// 提前渲染模版
var data = {
    list: [
        {name: 'opened'},
        {name: 'doing'},
        {name: 'received'},
        {name: 'review'},
        {name: 'refuse'},
        {name: 'assignment'}
    ]
};

page.render('#opened-main', data, {
    partials: {
        page: pageTpl
    }
});

page.enter = function () {
    // var me = this;

    this.initRemindNum();

    // new Sticky({target: '#search', top: 0});
    // ^.^ 这里的后面的逻辑太过于复杂，暂未提供后面功能的返回刷新功能
    if (this.isRefresh) {
        return;
    }

    // 设置滚动的元素的高宽
    $('.slider-container').css({
        width: $(window).width(),
        height: $(window).height() - ($('#search').length ? $('#search').height() : 0)
    });

    // 初始化顶部的 tab
    this.initTab();

    // 切换内容的 page 页
    this.initPageSlider();

    this.bindEvents();
};

page.deviceready = function () {
    var me = this;

    navigation.left({
        click: function () {
            navigation.open(-1, {
                goBackParams: 'refresh'
            });
        }
    });

    navigation.right([
        {
            icon: me._shell.right.add,
            click: function () {
                navigation.open('/task-new.html', {
                    title: me.lang.newTask,
                    returnParams: function (prevData) {
                        if (prevData && prevData === 'refresh') {
                            me.refresh();
                        }
                    }
                });
            }
        }
    ]);
};

page.bindEvents = function () {
    var me = this;

    $('#main').off('click').on('click', '.list-item', function () {
        var id = $(this).data('id');

        if (id) {
            navigation.open('/task-detail.html?taskId=' + id, {
                title: me.lang.taskDetail,
                returnParams: function (prevData) {
                    if (prevData && prevData === 'refresh') {
                        me.refresh();
                    }
                }
            });
        }
    });

    $('.search-in').off('click').on('click', function () {
        navigation.open('/search-search.html?role=' + rid, {
            title: me.lang.search
        });
    });

    $('.main').on('click', '.task-empty button', function () {
        navigation.open('/task-new.html');
    });
};

/**
 * 初始化顶部 tab
 */
page.initTab = function () {
    var $tab = $('.tab');
    var $ul = $tab.find('ul');
    var defWidth = $tab.width();

    $tab.width(999);
    $ul.width($ul.width() + 8);
    $tab.width(defWidth);

    // 右侧可见区域
    var max = $tab.width();

    var myScroll;

    setTimeout(function () {

        // 初始化 scroll
        myScroll = new IScroll('.tab', {
            scrollX: true,
            scrollY: false,
            scrollbars: false,
            click: true,

            // 禁用监听鼠标和指针
            disableMouse: true,
            disablePointer: true,

            mouseWheel: false,

            // 快速触屏的势能缓冲开关
            momentum: false
        });
    }, 0);

    // 始终保持 tab 点击项在可视区域
    var $tabs = $ul.find('li');
    $tabs.off('click');
    $tabs.on('click', function (event) {
        event.stopPropagation();

        var $li = $(this);
        var curLeft = $li.offset().left;
        var curWidth = $li.width();
        var move = null;

        if (curLeft < 0) {
            if ($li.index() - 1 < 0) {
                move = 0;
            }
            else {
                move = $li.position().left * -1;
            }

            myScroll.scrollTo(move, 0, 100);
        }

        // 当前点击项的右侧距离滑动的位置
        var curViewRight = curLeft + curWidth;
        var diff = max - curViewRight;

        if (curLeft > 0 && diff < 0) {
            move = max - ($li.position().left + curWidth);
            myScroll.scrollTo(move, 0, 100);
        }
    });
};

/**
 * 初始化配置 滑动切换页面 函数
 *
 */
page.initPageSlider = function () {

    new PageSlider({
        outer: '#slider-outer',
        tabs: '.page-loader li',
        pages: pages,

        onSlide: function (target, info) {

            switchPage(target, info);

            new LoadPage(info);
        }
    });
};

/**
 * 切换页面
 *
 * @param {Element} target, 点击的 tab
 * @param {Object} info, 当前展示的页面配置
 */
function switchPage(target, info) {

    if (!info || !info.name) {
        return;
    }

    // search bar 添加 border
    if (/done|cancel/.test(info.name)) {
        $('.search-inner').addClass('border');
    }
    else {
        $('.search-inner').removeClass('border');
    }

    var $wrapper = $(info.selector);
    var filter = $(target).data('filter');

    // 如果有数据的情况下，重新切换回 opened tab，则不触发opened 的 z 改变
    var myPage = pageCache[info.name];

    if (myPage) {

        // myPage.fn && myPage.fn.pagination.show();

        // 点击已有数据的未完成，要特殊处理下
        if (myPage.name === 'opened' && filter) {

            // var $second = $('.tab .selected');
            // var selectedName = $second.data('name');
            // pageCache[selectedName].fn.pagination.show();

            return;
        }
    }

    $wrapper.css({
        'z-index': 2
    });

    $wrapper.siblings().css({
        'z-index': 1
    });
}

/**
 * 加载页面
 *
 * @param {Object} info, 当前展示的页面配置
 */
function LoadPage(info) {

    if (pageCache[info.name]) {
        return;
    }

    // 这里只绑定数据
    pageCache[info.name] = {
        name: info.name,
        fn: null,
        data: null
    };

    var $wrapper = $(info.selector);
    var $tab = $('.tab');
    var $loader = $wrapper.find('.data-more');
    var $search = $('#search');
    var $fixbar = $('#fixbar');

    // num: margin
    var offset = 6
                + $search.height()
                + $fixbar.height()
                // 0 or undefined 才需要 这个高度, 未完成 的相关页都需要
                + (!info.index ? $tab.height() : 0)
                + ($loader.length ? $loader.height() : 0);

    var api = info.api || config.API.GET_TASK_LIST;

    var params = {};

    pageCache[info.name].fn = new InitPage({
        isApple: page._shell.apple,
        wrapper: $wrapper.find('.scroll-outter'),
        main: '.list-wrapper-content',
        status: info.params.status,

        // ajax request
        promise: function () {

            params = $.extend({
                role: rid,
                currPage: this.page,
                number: 10
            }, info.params || {});

            return page.get(api, params);
        },

        // 储存第一次加载的数据
        onFirstDone: function (data) {
            pageCache[info.name].data = data;

            coll.update(data, {
                rid: rid,
                status: params.status
            });
        },

        onDataNull: function (loader) {
            var data = {
                lang: {
                    noTask: page.lang.noTask,
                    createTask: page.lang.createTask
                }
            };
            page.render(loader.wrapper, data, {
                tmpl: emptyTaskTpl
            });
            // loader.render(data, emptyTaskTpl);
        },

        // 加载失败
        onLoadError: function () {
            delete pageCache[info.name];
        },

        tpl: listTpl,
        offset: offset,
        lang: page.lang
    });
}

/**
 * 设置计数器
 */
page.initRemindNum = function () {

    var promise = this.get(config.API.DOCK_REMIND, {
        role: util.params('rid')
    });

    promise
        .done(function (result) {
            if (result && result.meta.code === 200) {
                new Pharos('#fixbar', result.data);
            }
        });
};

page.start();
