/**
 * @file new.js
 * @author hefeng
 * 新建任务页
 *
 */

require('../edit/new.scss');

var config = require('../config');
var Page = require('../common/page');

//  var CPNavigationBar = require('dep/campo-navigationbar/campo-navigationbar');

var page = new Page();

var valid = {
    title: false,
    content: true
};

var info = {
    title: '',
    comtent: '',
    master: '',
    canyuren: [],
    doneTime: 0,
    urgency: 0
};

/**
 * 验证不通过弹窗
 *
 * @param {string} info, 验证不通过的提示语句
 *
 */
function validAlert(info) {
    var alertClass = 'alert-info';

    if ($('.' + alertClass).length) {
        return;
    }

    // alert html
    var alert = '<div class="' + alertClass + '">' + info + '</div>';

    $('body').append(alert);

    setTimeout(function () {
        $('.' + alertClass).fadeOut('fast').remove();
    },
    3000);
}

/**
 * 选择完成时间跳转页面的回掉函数
 *
 */
function chooseTimeCB() {
    // require('./edit/done-time.scss');


}
page.enter = function () {
    var me = this;



    page.loadPage();
};

/**
 * 绑定事件
 *
 */
page.bindEvents = function () {
    // 保存输入DOM
    var $titleDom = $('#edit-title');
    var $contentDom = $('#edit-content');

    /**
     * 切换关闭按钮的显示与隐藏
     *
     * @param {Object} textDom, 当前输入框dom对象
     * @param {number} textLength, 输入框内文字长度
     *
     */
    function toggleX(textDom, textLength) {
        if (!textLength) {
            $(textDom).parent().find('.close-x').hide();
        }
        else {
            $(textDom).parent().find('.close-x').show();
        }
    }

    $titleDom.on('input propertychange', function () {
        var me = this;
        var length = $(me).val().length;
        var errTip = $(me).next('.err-tip');

        toggleX(me, length);

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
            errTip.text('');
        }
    });

    $('.edit-title-wrap').click(function () {
        $titleDom.focus();
    });

    $contentDom.on('input propertychange', function () {
        var me = this;
        var length = $(me).val().length;
        var errTip = $(me).next('.err-tip');

        toggleX(me, length);

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
        $contentDom.focus();
    });

    // $('#doneTime').click(function () {
    //     CPNavigationBar.redirect('./edit/done-time.html', '完成时间', false, chooseTimeCB, info)
    // });

    var mobiOptions = {
        theme: 'android-holo-light',
        mode: 'scroller',
        // ios 底部上滑, android 中间显示
        display: (/(iphone|ipad)/i).test(navigator.appVersion) ? 'bottom' : 'modal',
        lang: 'zh',
        buttons: ['cancel', 'set'],
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
                value: '2'
            },
            {
                text: '紧急',
                value: '3'
            }
        ],
        onSelect: function (text, inst) {
            info.urgency = +inst.getVal();
            $('#urgencyBlock .value').text(text);
        }
    }));
};

/**
 * 加载页面
 *
 * @param {Object} data, 当前要渲染的模板数据
 *
 */
page.loadPage = function (data) {
    var me = this;

    data = data || {};
    data = $.extend(data, {
        view: {
            task: true,
            event: false,
            discussion: false,
            placeholder: '任务',
            data: []
        }
    });

    require.ensure(['../edit/edit'], function () {
        var template = require('../edit/edit');
        var $content = $('.edit-container');
        me.renderFile($content, template, data);
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
                    dfd.reject(result);
                }
                else {
                    me.data = result.data;
                    dfd.resolve();
                }
            });
    });
}

// editAjax();

$(function () {
    page.start();
});
