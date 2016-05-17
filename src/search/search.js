/**
 * @file search.js
 * @author hefeng
 * 搜索页
 *
 */

require('dep/touch');
var config = require('config');
var Page = require('common/page');
var Search = require('common/widgets/search/searchPage');

var page = new Page({
    pageName: 'search-search'
});

page.enter = function () {
    var me = this;

    new Search(me, {
        isSearchPage: true,
        selector: '#search',
        url: config.API.SEARCH,
        listDir: 'list'
    });
};

$(function () {
    page.start();
});
