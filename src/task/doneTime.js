/**
 * @file doneTime.js
 * @author hefeng
 * 完成时间跳转页
 *
 */

require('./doneTime.scss');
var Page = require('common/page');
var util = require('common/util');
var editCom = require('common/widgets/edit/editCommon');
// var CPNavigationBar = require('dep/plugins/campo-navigationbar/campo-navigationbar');

var page = new Page();


var info = {
    endTime: 0
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
    $('.option .hook').addClass('hide');
    $('.' + currClass + ' .hook').removeClass('hide');
}

page.enter = function () {
    this.initValue();
    this.bindEvents();
    this.initPlugin();
};

/**
 * 绑定事件
 *
 */
page.bindEvents = function () {
    var me = this;
    $('.done-early').on('click', function () {
        setCurr('done-early');
    });

    $('#submit').on('click', function () {
        me.returnValue(true);
    });
};

page.initPlugin = function (initTime) {
    var defaultTime = info.endTime ? new Date(info.endTime) : new Date();
    editCom.initMobiscroll('datetime', '.custom-time', {
        headerText: '<span class="dw-tab-data dw-tab-selected">日期</span><span class="dw-tab-time">时间</span>',
        minDate: new Date(date.y - 50, 0, 1),
        maxDate: new Date(date.y + 50, 11, 31, 23, 59, 59),
        defaultValue: defaultTime,
        yearSuffix: '年',
        monthSuffix: '月',
        daySuffix: '日',
        hourSuffix: '时',
        minuteSuffix: '分',
        onSelect: function (text, inst) {
            // 完整毫秒数
            info.endTime = new Date(inst.getVal()).getTime();
            // 此处 添加你自己的代码
            $('.done-time-value').text(util.formatTime(info.endTime));
            setCurr('custom-time');
        }
    });
};

page.initValue = function () {
    var endTime = +util.getUrlParams().endTime;
    info.endTime = endTime ? endTime : 0;
    if (!info.endTime) {
        setCurr('done-early');
    }
    else {
        $('.done-time-value').text(util.formatTime(info.endTime));
        setCurr('custom-time');
    }
};

page.returnValue = function (hasVal) {
    /* eslint-disable */
    if (hasVal) {
        CPNavigationBar.setPreviousPageReturnStringData(JSON.stringify(info));
    }
    CPNavigationBar.returnPreviousPage();
    /* eslint-enable */
};

$(function () {
    page.start();
});
