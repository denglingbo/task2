/**
 * @file search.js
 * @author hefeng
 * 搜索页
 *
 */

var config = require('config');
var util = require('common/util');
var Page = require('common/page');

var Search = require('common/widgets/search/searchEnter');

var page = new Page();

page.enter = function () {
    var me = this;
    me.search = new Search(me, {
        url: config.API.SEARCH_TASK,
        role: util.params('role'),
        selector: '#search'
    });
};

page.start();
