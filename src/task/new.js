/**
 * @file new.js
 * @author hefeng
 * 新建任务页
 *
 */

require('./new.scss');

var config = require('../config');
var Page = require('../common/page');

var page = new Page();

page.enter = function () {
	var me = this;



	this.bindEvents();
};

page.bindEvents = function() {

};