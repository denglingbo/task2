/**
 * @file search.js
 * @author hefeng
 * 搜索页
 *
 */

var config = require('config');
var util = require('common/util');
var Page = require('common/page');
var IScroll = require('dep/iscroll');

var Search = require('common/widgets/search/searchEnter');

var page = new Page();

// var key = '';

page.enter = function () {
    var me = this;
    me.search = new Search(me, {
        url: config.API.SEARCH_TASK,
        role: util.params('role'),
        isSearchPage: true,
        selector: '#search'
    });
    // var search = me.search;
    // search.setKey(key);
    // search.stateChange();
    // search.togglePage(true);
    $('.search-page').height($(window).height());
    // 初始化 scroll
    new IScroll('.search-page', {
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
};

/**
 * 匹配搜索结果中的关键字, 为关键字添加红色的className
 *
 * @param {Object} data, 待处理的搜索数据
 */
// function setResultKey(data) {
//     var value = key;
//     var reg = new RegExp(value);

//     data.objList.forEach(function (item) {
//         item.title = item.title.replace(reg, '<span class="input-key">' + value + '</span>');
//     });
// }

/**
 * 搜索结果不为空的处理函数, 渲染搜索结果列表
 *
 */
// page.renderList = function () {
//     var me = this;
//     setResultKey(me.data);
//     me.render('.search-content', me.data.objList, {
//         tmpl: '{{#.}}<li class="item" data-id="{{id}}" data-taskId="{{taskId}}">'
//             + '<a href="javascript:void(0);">{{& title}}</a>'
//             + '</li>{{/.}}'
//     });
// };

/**
 * 搜索结果为空时的处理函数, 渲染为空的展示页
 *
 */
// page.renderNull = function () {
//     var me = this;
//     me.render('.search-content',
//     {
//         lang: me.lang
//     },
//     {
//         tmpl: '<li class="no-output"><i class="icon-search-big"></i>{{lang.noMatchResults}}</li>'
//     });
// };

/**
 * 根据搜索结果来调用渲染页面的处理函数
 *
 */
// page.renderOutput = function () {
//     var me = this;
//     var dataIsNull = !me.data.objList.length;

//     if (dataIsNull) {
//         me.renderNull();
//     }
//     else {
//         me.renderList();
//     }
// };

/**
 * 发送请求, 获取搜索结果
 *
 * @param {string} value, 搜索关键字
 */
// page.loadList = function (value) {
//     if (value === '') {
//         return;
//     }

//     var me = this;
//     var data = {
//         title: value,
//         /* eslint-disable */
//         currPage: 1,
//         /* eslint-enable */
//         number: 15
//     };
//     /* eslint-disable */
//     me.api.taskId && (data.taskId = me.api.taskId);
//     /* eslint-enable */
//     var promise = me.get(me.api.list, data);

//     promise
//         .done(function (result) {
//             if (result.meta.code === 200) {
//                 me.data = result.data;
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
//             if (!$('#search-input').val().length) {
//                 $('.search-tip').removeClass('hide');
//             }
//         });
// };

// page.addParallelTask(function (dfd) {
//     var me = this;

//     var role = util.params('role');
//     key = util.params('key');
//     key = key ? decodeURIComponent(key) : '';
//     var value = key;
//     var data = {
//         title: value,
//         role: role,
//         /* eslint-disable */
//         page: 1,
//         /* eslint-enable */
//         number: 15
//     };
//     /* eslint-enable */
//     var promise = me.get(config.API.SEARCH_TASK, data);

//     promise
//         .done(function (result) {
//             if (result.meta.code !== 200) {
//                 dfd.reject(result);
//             }
//             else {
//                 me.data = result.data;
//                 dfd.resolve();
//             }
//         })
//         .fail(function (result) {
//             dfd.reject(result);
//         });
//     return dfd;
// });

$(window).on('load', function () {
    page.start();
});
