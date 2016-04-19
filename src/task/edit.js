/**
 * @flie edit.js
 * @author hefeng
 * 编辑任务页
 *
 */

require('./new.scss');

var config = require('../config');
var Page = require('../common/page');

var page = new Page();

var valid = {
	title: false,
	content: true
}

page.enter = function () {

	this.loadPage(this.data);

};

page.bindEvents = function () {
	var $titleDom = $("#edit-task-title");
	var $contentDom = $("#edit-task-content");
	/*$titleDom.parent().on('tap', function () {
		$titleDom.focus();
	});
	$contentDom.parent().on('tap', function () {
		$contentDom.focus();
	});*/
	$titleDom.on("input propertychange", function () {
		var me = this;
		var length = $(me).val().length;
		var errTip = $(me).next(".err-tip");

		if (!length || length > 50) {
			valid.title = false;
		}
		else {
			valid.title = true;
		}
		
		if (length > 50) {
			errTip.text(50 - length);
		}
		else {
			errTip.text("");
		}
	});

	$contentDom.on("input propertychange", function () {
		var me = this;
		var length = $(me).val().length;
		var errTip = $(me).next(".err-tip");

		if (length > 50000) {
			valid.content = false;
			errTip.text(50000 - length);
		}
		else {
			valid.content = true;
			errTip.text("");
		}
	});
};

/**
 * 加载页面
 *
 * @param {object} data 当前要渲染的模板数据
 *
 */
page.loadPage = function (data) {
	var me = this;

	require.ensure(['./edit/edit'], function() {
		var template = require('./edit/edit');
		var $content = $('.task-container');
		me.render($content, template, data);
		me.bindEvents();
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
	var promise = page.post(config.API.TASK_EDIT_URL, {});

	promise
		.done(function (result) {
			if (result.meta !== 0) {
				dfd.reject(result)
			}
			else {
				me.data = result.data;
				dfd.resolve();
			}
		});
});

$(function () {
	page.start();
})
