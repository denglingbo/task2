/**
 * @file affair.js
 * @author hefeng
 * 新建事件页, 编辑事件页面
 *
 */

require('../common/widgets/edit/new.scss');
/* eslint-disable */
var Mustache = require('dep/mustache');
/* eslint-disable */
require('dep/plugins/attaches/attaches');
var config = require('../config');
var Page = require('../common/page');

// var CPNavigationBar = require('dep/campo-navigationbar/campo-navigationbar');

var page = new Page();

var valid = {
    title: false,
    content: true
};

var info = {
    id: '',
    title: '',
    comtent: '',
    importanceLevel: 0,
    affairType: 0
};

/* eslint-disable */
/**
 * 验证不通过弹窗
 *
 * @param {string} info, 验证不通过的提示语句
 *
 */
function validAlert(info) {
    var $alertDom = $('.alert-length-limit');
    $alertDom.text(info).removeClass('hide');

    setTimeout(function () {
        $alertDom.addClass('hide');
    },
    3000);
}
/* eslint-disable */

/**
 * 转换string驼峰
 *
 * @param {string} str, 需要转换的字符串
 * @return {string} 转换后的驼峰命名
 */
function camelCase(str) {
    return str.replace(/_+(.)?/g, function (str, e) {
        return e ? e.toUpperCase() : "";
    });
}

/**
 * 附件传入data key转为 camelCase
 *
 * @param {Array} arr, 附件传入data
 *
 * @return {Array}, 属性转换成驼峰命名的对象的集合
 */
function transKey(arr) {
    var newArr = [];
    if ($.isArray(arr)) {
        newArr = arr;
    }
    else if (arr instanceof Object) {
        newArr.push(arr);
    }
    var outArr = [];
    var newObj = {};
    for (var i = 0, len = newArr.length; i < len; i++) {
        var item = newArr[i];
        newObj = {};
        for (var key in item) {
            if (item.hasOwnProperty(key)) {
                newObj[camelCase(key)] = item[key];
            }
        }
        outArr.push(newObj)
    }
    return outArr;
}

/**
 * 切换关闭按钮的显示与隐藏
 *
 * @param {Object} textDom, 当前输入框dom对象
 * @param {number} textLength, 输入框内文字长度
 *
 */
function toggleX(textDom, textLength) {
    if (!textLength) {
        $(textDom).parent().find('.close-x').addClass('hide');
    }
    else {
        $(textDom).parent().find('.close-x').removeClass('hide');
    }
}

page.enter = function () {
    page.loadPage(this.data);
};

/**
 * 绑定事件
 *
 */
page.bindEvents = function () {
    var me = this;
    var $titleDom = $('#edit-title');
    var $contentDom = $('#edit-content');

    $('.close-x').click(function () {
        var $parentDom = $(this).parent();
        $parentDom.find('.input').val('');
        $parentDom.find('.err-tip').text('');
        $(this).addClass('hide');
        if ($parentDom.hasClass('edit-title-wrap')) {
            valid.title = false;
        }
    });

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

    require.ensure(['../common/widgets/edit/edit'], function () {
        var template = require('../common/widgets/edit/edit');
        var $content = $('.edit-container');
        me.renderFile($content, template, $.extend({}, data, {
            view: {
                task: false,
                affair: false,
                talk: false,
                placeholder: '事件',
                data: []
            }
        }));
        page.initPlugin(data)
        page.initValue(data);
        me.bindEvents();
    });
};

page.initPlugin = function (data) {
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

    // 初始化附件组件
    var attache = new Attach({
        // 客户端信息
        clientMsg: {
            uid: '1',
            cid: '1',
            client: '',
            lang: '',
            pause: '',
            appver: '111.1.1'
        },
        // 已经有的附件信息，没有传空数组，这个主要是用于修改
        originAttaches:[],
        url: {
            uploadUrl: {
                url: '/mgw/approve/attachment/getFSTokensOnCreate',
                mothod: 'POST'
            },
            resumeUrl: {
                url: '/mgw/approve/attachment/getFSTokensOnContinue',
                mothod: 'POST'
            }
        },
        supportType: [
            // 本地文件
            1,
            // 网盘文件
            2,
            // 相册图片
            3,
            // 拍照上传
            4,
            // 语音上传
            5
        ],
        dom: {
            // 附件容器DOM元素
            containerDOM: $('.attach-list')
        },
        callback: function () {}
    });
    var renderString = Attach.getRenderString({attach: transKey(data.attachements)}, '11.1.1');
    $('.attach-list').append(renderString.attach);
    Attach.initEvent('.attach-list', 'zh_CN');
}

page.initValue = function () {
    // 设置默认值
    var importanceLevel = ['重要且紧急', '普通', '重要', '紧急'];
    $('#urgencyBlock .value').text(importanceLevel[data['importance_level']]);

    // 初始化文本框的关闭按钮
    $.each($('.input'), function (index, item) {
        toggleX($(item), $(item).val());
    });
}
/**
 * 请求页面接口
 *
 * @param {deferred} dfd, deferred
 *
 */
page.addParallelTask(function (dfd) {
    var me = this;

    var promise = page.post(config.API.AFFAIR_EDIT_URL, {});

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

$(function () {
    page.start();
});
