/**
 * @file raw.js
 * @author deo
 */
var util = require('common/util');
var lang = require('common/lang').getData();

var raw = {};

// 状态显示
var statusMap = {
    1: lang.doneText,
    2: lang.cancelText,
    3: lang.doingText,
    4: lang.receivedText,
    5: lang.assignmentText,
    6: lang.reviewText,
    7: lang.refuseText
};

// 紧要程度
var importanceMap = {
    1: lang.impLevel1,
    2: lang.impLevel2,
    3: lang.impLevel3,
    4: lang.impLevel4
};

raw.status = function (key, endDate) {

    // 这里对 进行中 的进行一次单独的判断，如果当前时间晚于结束时间，则单独修改状态文字未，延期
    if (util.now() > util.fixTimeZone(endDate) && key === 3) {
        return lang.delayText;
    }

    return statusMap[key] || '';
};

raw.importance = function (key) {
    return importanceMap[key] || '';
};


/**
 * 数字标准化，个位数前面补0
 *
 * @param {(string|number)} n, 要标准化的数字
 * @return {number} 标准化后的数字
 */
function formatter(n) {
    if (typeof n === 'string') {
        n = parseInt(n, 10);
    }

    if (n < 10) {
        return '0' + n;
    }
    return n;
}

/**
 * 获取日期信息
 *
 * @param {datetime} date, 指定日期
 * @param {boolean} isRaw, 是否修正到两位
 * @return {Object}
 */
function getDateInfo(date, isRaw) {

    var time = new Date(date);

    var month = time.getMonth() + 1;
    var d = time.getDate();
    var h = time.getHours();
    var m = time.getMinutes();

    return {
        time: time,
        y: time.getFullYear(),
        M: !isRaw ? month : formatter(month),
        d: !isRaw ? d : formatter(d),
        h: !isRaw ? h : formatter(h),
        m: !isRaw ? m : formatter(m),
        dayOfWeek: time.getDay()
    };
}

/**
 * 获得指定日期的结束日期
 *
 * @param {datetime} date, 指定日期
 * @return {boolean}
 */
function getWeekEndTime(date) {
    var dateObj = getDateInfo(date);
    var month = dateObj.time.getMonth();
    var dayOfWeek = dateObj.dayOfWeek;
    var endOfWeek = dateObj.d;

    // 周日
    if (dayOfWeek > 0) {
        endOfWeek += (7 - dayOfWeek);
    }

    var weekEndDate = new Date(dateObj.y, month, endOfWeek);

    return weekEndDate.getTime();
}

/**
 * 距离 date 几周, [负数] 代表已经过去的周数，[0] 代表本周， [正数] 代表之后的周数
 *
 * @param {datetime} date, 要判断指定日期距离今天的周数
 * @return {number}
 */
function getWeeksAway(date) {
    var now = util.now();

    var nowWeekTime = getWeekEndTime(now);
    var dateWeekTime = getWeekEndTime(date);

    var diff = dateWeekTime - nowWeekTime;

    return Math.floor(diff / (86400000 * 7));
}

/**
 * 年的展示逻辑
 *
 * @param {number} date 要处理的事件戳
 * @return {string}
 */
function yearRaw(date) {

    var dateInfo = getDateInfo(date, true);
    var nowInfo = getDateInfo(util.now());

    if (dateInfo.y - nowInfo.y === 0) {
        return dateInfo.M + '-' + dateInfo.d + ' ' + dateInfo.h + ':' + dateInfo.m + ' ' + lang.beforeText;
    }

    return util.dateformat(dateInfo.time, true) + ' ' + lang.beforeText;
}

/**
 * 获取时间戳距离当前时间有多久的文案
 *
 * @param {number} date 要处理的事件戳
 * @param {number} now 当前时间戳
 * @return {string} 事件间隔的文案
 */
raw.dateToDone = function (date, now) {

    if (!date) {
        return '';
    }

    if (!now) {
        now = util.now();
    }

    var diff = date - now;

    var dateInfo = getDateInfo(date, true);
    // var nowInfo = getDateInfo(now);

    if (diff < 0) {
        return yearRaw(date);
    }

    var oneday = 86400000;

    // 1-24h
    if (diff < oneday) {
        return lang.todayText + ' ' + dateInfo.h + ':' + dateInfo.m + ' ' + lang.beforeText;
    }

    if (diff < oneday * 2) {
        return lang.mornText + ' ' + dateInfo.h + ':' + dateInfo.m + ' ' + lang.beforeText;
    }

    var weeksAway = getWeeksAway(date);

    if (weeksAway === 0) {
        return lang.currentWeekText + dateInfo.dayOfWeek + ' ' + dateInfo.h + ':' + dateInfo.m + ' ' + lang.beforeText;
    }

    if (weeksAway === 1) {
        return lang.nextWeekText + dateInfo.dayOfWeek + ' ' + dateInfo.h + ':' + dateInfo.m + ' ' + lang.beforeText;
    }

    return yearRaw(date);
};

module.exports = raw;
