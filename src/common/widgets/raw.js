/**
 * @file raw.js
 * @author deo
 */
var util = require('common/util');
var lang = require('common/lang').getData();

var raw = {};

// 状态显示
var statusMap = {
    0: lang.undoneText,
    6: lang.doneText,
    7: lang.cancelText,
    4: lang.doingText,
    1: lang.receivedText,
    2: lang.assignmentText,
    5: lang.reviewText,
    3: lang.refuseText
};

raw.statusMap = statusMap;

// 紧要程度
var importanceMap = {
    1: lang.importantAndUrgent,
    2: lang.important,
    3: lang.urgent,
    4: lang.general
};

raw.importanceMap = importanceMap;

raw.delay = function (key, endDate) {
    // 尽快完成，不需要延期标识符
    if (endDate === 0) {
        return '';
    }

    // 这里对 {进行中} 的进行一次单独的判断，如果当前时间晚于结束时间，则单独修改状态文字未，延期
    if (util.now() > util.fixTimeZone(endDate) && key === 4) {
        return 'icon-delay';
    }

    return '';
};

raw.status = function (key) {
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
        return dateInfo.M + '-' + dateInfo.d
                + ' ' + dateInfo.h + ':' + dateInfo.m
                + ' ' + lang.beforeText;
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
raw.formatDateToNow = function (date, now) {

    if (!date) {
        return '';
    }

    if (!now) {
        now = util.fixTimeZone(new Date()).getTime();
    }

    var diff = now - date;

    // error
    // java 返回的时间非准确值
    // if (diff < 0) {
    //     return null;
    // }
    // 0-60s
    if (diff < 60000) {
        return '刚刚';
    }
    // 1-15min
    if (diff < 900000) {
        return Math.round(diff / 60000) + '分钟前';
    }
    // 16-30min
    if (diff < 1800000) {
        return '半小时前';
    }
    // 30-60min
    if (diff < 3600000) {
        return '1小时前';
    }
    // 1-24h
    if (diff < 86400000) {
        return Math.floor(diff / 3600000) + '小时前';
    }
    // 1d-4d
    if (diff < 345600000) {
        return Math.floor(diff / 86400000) + '天前';
    }

    // > 4d
    return util.dateformat(date, true);
};

/**
 * 获取时间戳距离当前时间有多久的文案
 *
 * @param {number} date 要处理的事件戳
 * @param {number} now 当前时间戳
 * @return {string} 事件间隔的文案
 */
raw.dateToDone = function (date, now) {

    if (date === 0) {
        return '尽快完成';
    }

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
        return lang.currentWeekText + dateInfo.dayOfWeek
                + ' ' + dateInfo.h + ':' + dateInfo.m + ' '
                + lang.beforeText;
    }

    if (weeksAway === 1) {
        return lang.nextWeekText + dateInfo.dayOfWeek
                + ' ' + dateInfo.h + ':' + dateInfo.m
                + ' ' + lang.beforeText;
    }

    return yearRaw(date);
};

module.exports = raw;
