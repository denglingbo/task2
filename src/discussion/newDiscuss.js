/**
 * @file newDiscuss.js
 * @author hefeng
 * 新建讨论页, 编辑讨论页面
 *
 */

require('../edit/new.scss');

var config = require('../config');
var Page = require('../common/page');

var page = new Page();

var valid = {
	title: false,
	content: true
}

var info = {
	title: '',
	comtent: '',
	urgency: 0,
	canyuren: []
}

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

	page.loadPage(this.data)
};

/**
 * 绑定事件
 *
 */
page.bindEvents = function () {

	$("#edit-title").on("input propertychange", function () {
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

	$('.edit-title-wrap').click(function () {
		$("#edit-title").focus();
	});

	$("#edit-content").on("input propertychange", function () {
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

	$('.edit-words').click(function () {
		$("edit-content").focus();
	});

	var mobiOptions = {
        theme: 'android-holo-light',
        mode: 'scroller',
        display: (/(iphone|ipad)/i).test(navigator.appVersion) ? 'bottom' : 'modal',  //ios 底部上滑, android 中间显示
        lang: 'zh',
        buttons: ['cancel','set'],
        height: 50
    };

	$('#urgencyBlock').mobiscroll().select($.extend({}, mobiOptions, {
        headerText: '紧急程度',
        showInput: false,
        showMe: true,
        rows: 3,
        data: [
            {
                text: '重要且紧急',
                value: '0'
            },
            {
                text: '普通',
                value: '1',
                selected: true
            },
            {
                text: '重要',
                value: '2',
            },
            {
                text: '紧急',
                value: '3'
            }
        ],
        onSelect: function(text,inst){
            info.urgency = +inst.getVal();
            $('#urgencyBlock .value').text(text);
        }
    }));
};

/**
* 加载页面
*
* @param {object} data 当前要渲染的模板数据
*
*/
page.loadPage = function (data) {
	var me = this;

	data = data || {};
	data = $.extend(data,{
		view: {
			task: false,
			event: false,
			discussion: true,
			placeholder:'讨论',
			data: []
		}
		
	})

	require.ensure(['../edit/edit'], function() {
		var template = require('../edit/edit');
		var $content = $('.edit-container');
		me.render($content, template, data);
		me.bindEvents();
	});
};

/**
 * 编辑页面加载数据
 *
 */
function editAjax() {

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
}

$(function () {
	page.start();
});