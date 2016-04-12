
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

var asyncPages = (function () {
    
    var arr = [];

    pages.forEach(function (item) {
        arr.push(item.url);
    });

    return arr;
})();

function loadPage(me, obj) {

    require.ensure(['./pages/doing.html', './pages/done.html', './pages/cancel.html'], function (require) {
        
        var template = require(obj.url);
        me.render(obj.selector, template, me.data);  
    });

    // var template = require(url);
    // me.render(obj.selector, template, me.data);  
}

page.enter = function () {

    var me = this;

    // new Sticky({
    //     target: selector,
    //     top: 0
    // });

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

page.getListPage = function () {

    // var tplDone = require('page/list/done');
    // this.render('#list-wrapper-done', tplDone, this.data);

    // var tplCancel = require('page/list/cancel');
    // this.render('#list-wrapper-cancel', tplCancel, this.data);
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