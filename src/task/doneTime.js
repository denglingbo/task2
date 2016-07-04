/**
 * @file doneTime.js
 * @author hefeng
 * 完成时间跳转页
 *
 */

require('./doneTime.scss');
require('dep/ui/mobiscroll/css/mobiscroll-2.17.0.css');
require('dep/ui/mobiscroll/js/mobiscroll-2.17.0.js');
var Page = require('common/page');
var util = require('common/util');
var editCom = require('common/widgets/edit/editCommon');
var navigation = require('common/middleware/navigation');

var page = new Page();
var lang = page.lang;

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
    var me = this;
    me.render('#done-container', {lang: me.lang});

    me.initValue();
    me.bindEvents();
    me.initPlugin();
};

/**
 * 绑定事件
 *
 */
page.bindEvents = function () {
    $('.done-early').on('click', function () {
        setCurr('done-early');
        info.endTime = 0;
    });
};

page.initPlugin = function (initTime) {
    var defaultTime = info.endTime ? new Date(info.endTime) : new Date();
    editCom.initMobiscroll('datetime', '.custom-time', {
        headerText: '<span class="dw-tab-data dw-tab-selected">'
            + lang.date + '</span><span class="dw-tab-time">' + lang.time + '</span>',
        minDate: new Date(date.y - 50, 0, 1),
        maxDate: new Date(date.y + 50, 11, 31, 23, 59, 59),
        defaultValue: defaultTime,
        yearSuffix: lang.year,
        monthSuffix: lang.month,
        daySuffix: lang.day,
        hourSuffix: lang.hour,
        minuteSuffix: lang.monutes,
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

page.deviceready = function () {
    var me = this;

    navigation.left({
        click: function () {
            me.returnValue();
        }
    });
};

page.returnValue = function () {
    navigation.open(-1, {
        goBackParams: JSON.stringify(info)
    });
};

page.start();
