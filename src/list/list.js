
require('./list.scss');

var config = require('../config');
var Page = require('../common/page');
var Sticky = require('../ui/js/sticky');
var SliderPage = require('../ui/js/sliderPage');

var page = new Page();

var pages = [
    {
        name: 'doing',
        selector: '#list-wrapper-doing',
        index: 0,
        url: './pages/doing.html',
        current: true
    },
    {
        name: 'done',
        selector: '#list-wrapper-done',
        url: './pages/done.html',
        index: 1
    },
    {
        name: 'cancel',
        selector: '#list-wrapper-cancel',
        url: './pages/cancel.html',
        index: 2
    }
];

var templateCache = {};

/**
 * 加载页面
 * @param {context} me, this -> page
 * @param {Object} obj, 当前展示的页面配置
 *
 */
function loadPage(me, obj) {alert(1)

    require.ensure(['./pages/doing.html', './pages/done.html', './pages/cancel.html'], function (require) {
        
        if (!templateCache[obj.name]) {
            var template = require(obj.url);
            var html = me.render(obj.selector, template, me.data);

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