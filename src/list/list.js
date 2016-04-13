/**
 * @file list.js
 * @author deo
 * 列表页
 *
 */

require('./list.scss');

var config = require('../config');
var Page = require('../common/page');
// var Sticky = require('../ui/js/sticky');
var SliderPage = require('../ui/js/sliderPage');

var page = new Page();

var pages = [
    {
        name: 'doing',
        selector: '#list-wrapper-doing',
        index: 0,
        url: './pages/doing',
        current: true
    },
    {
        name: 'done',
        selector: '#list-wrapper-done',
        url: './pages/done',
        index: 1
    },
    {
        name: 'cancel',
        selector: '#list-wrapper-cancel',
        url: './pages/cancel',
        index: 2
    }
];

var templateCache = {};

/**
 * 加载页面
 *
 * @param {context} me, Page 自身
 * @param {Object} obj, 当前展示的页面配置
 *
 */
function loadPage(me, obj) {

    require.ensure(['./pages/doing', './pages/done', './pages/cancel'], function (require) {
        if (!templateCache[obj.name]) {
            var template = require(obj.url);
            me.render(obj.selector, template, me.data);

            templateCache[obj.name] = true;
        }
    });

}

page.enter = function () {

    var me = this;

    // new Sticky({target: selector, top: 0});

    new SliderPage({
        selector: '.tab-page li',
        pages: pages,

        onStart: function (obj) {
            loadPage(me, obj);
        },

        onSlide: function (obj) {
            loadPage(me, obj);
        }
    });

    this.bindEvents();
};

page.bindEvents = function () {

};

/**
 * 请求页面接口
 *
 * @param {deferred} dfd, deferred
 *
 */
page.addParallelTask(function (dfd) {
    var me = this;
    var promise = page.post(config.API.LIST_URL, {});

    promise
        .done(function (result) {
            if (result.status !== 0) {
                dfd.reject(result);
            }
            else {
                me.data = result.data;
                dfd.resolve();
            }
        });
});

$(function () {
    page.start();
});
