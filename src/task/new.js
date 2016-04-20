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

var valid = {
	title: false,
	content: true
}

//var maskBindDom = [];
/**
 * @生成和取消mask
 *
 * @param {boolean} bool 值为true生成mask,false取消mask
 *
 */
/*function mask(bool) {
	if (bool) {
		if (!$('.mask').length) {
			$('body').append('<div class="mask"></div>');
		}
	}
	else {
		$('.mask').remove();
	}
}*/

/**
 * 验证不通过弹窗
 *
 * @param {string} info 验证不通过的提示语句 
 *
 */
function validAlert (info) {
	var alertClass = "alert-info";
	if($('.' + alertClass).length){
		return;
	}
	var alert = '<div class="'+ alertClass +'">'+ info +'</div>';
	$('body').append(alert);
	setTimeout(function () {
		$('.' + alertClass).fadeOut('fast').remove();
	}, 
	3000);
}

page.enter = function () {
	var me = this;



	this.bindEvents();
};

/**
 * 绑定事件
 *
 */
page.bindEvents = function () {
	
	$("#new-task-title").on("input propertychange", function () {
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

	$('.task-title-wrap').click(function () {
		$("#new-task-title").focus();
	});

	$("#new-task-content").on("input propertychange", function () {
		var me = this;
		var length = $(me).val().length;
		var errTip = $(me).next(".err-tip");
		if (length > 50000) {
			valid.content = false;
			errTip.text(50000 - length);
		}
		else {
			valid.content = true;
			errTip.text('');
		}
	});

	$('.task-words').click(function () {
		$("#new-task-content").focus();
	});

	$('#urgencyBlock').click(function () {
		var me = this;
		
	});

};

$(function () {
	page.start();
});
