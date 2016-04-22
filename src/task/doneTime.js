/**
 * @file done-time.js
 * @author hefeng
 * 完成时间跳转页
 *
 */

require('./doneTime.scss');

var Page = require('../common/page');

var page = new Page();

var info = {
    time: 0
};

var mobiOptions = {
    theme: 'android-holo-light',
    mode: 'scroller',
    // ios 底部上滑, android 中间显示
    display: (/(iphone|ipad)/i).test(navigator.appVersion) ? 'bottom' : 'modal',
    lang: 'zh',
    buttons: ['cancel', 'set'],
    height: 50
};

// 现在时间
var now = new Date();
var date = {
    y: now.getFullYear(),
    M: now.getMonth(),
    d: now.getDate(),
    h: now.getHours(),
    m: now.getMinutes(),
    s: now.getSeconds(),
    time: now.getTime()
};

/**
 * 设定option选中项
 *
 * @param {string} currClass, 当前点击元素的className
 *
 */
function setCurr(currClass) {
    $('.option').removeClass('current');
    $('.' + currClass).addClass('current');
}
page.enter = function () {
    page.bindEvents();
};

/**
 * 绑定事件
 *
 */
page.bindEvents = function () {
    $('.done-early').click(function (e) {
        setCurr('done-early');
    });

    $('.custom-time').mobiscroll().datetime($.extend({}, mobiOptions, {
        headerText: '<span class="dw-tab-data dw-tab-selected">日期</span><span class="dw-tab-time">时间</span>',
        minDate: new Date(date.y - 50, 0, 1),
        maxDate: new Date(date.y + 50, 11, 31, 23, 59, 59),
        defaultValue: new Date(),
        yearSuffix: '年',
        monthSuffix: '月',
        daySuffix: '日',
        hourSuffix: '时',
        minuteSuffix: '分',
        onSelect: function (text, inst) {
            // 年
            var y = inst._tempWheelArray[0];
            // 月
            var M = inst._tempWheelArray[1];
            // 日
            var d = inst._tempWheelArray[2];
            // 完整毫秒数
            info.time = new Date(inst.getVal()).getTime();
            // 此处 添加你自己的代码
            $('.done-time-value').text(y + '年' + M + '月' + d + '日');
            setCurr('custom-time');
        }
    }));
};

$(function () {
    page.start();
});
