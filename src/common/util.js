/**
 * @file util.js
 * @author deo
 * 工具包
 *
 */
var util = {};

util.qs = {};

/**
 * querystring stringify
 *
 * @param {Object} obj 需要处理的对象
 * @return {string}
 */
util.qs.stringify = function (obj) {
    if (!obj) {
        return '';
    }

    var pairs = [];
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key] !== undefined ? obj[key] : ''));
        }
    }

    return pairs.join('&');
};

/**
 * querystring parse
 *
 * @param {string} query query
 * @return {Object}
 */
util.qs.parse = function (query) {
    if (!query) {
        return {};
    }

    var obj = {};

    query = query.split('&');
    for (var i = 0; i < query.length; i++) {
        var p = query[i].split('=', 2);
        if (p.length === 1) {
            obj[p[0]] = '';
        }
        else {
            obj[p[0]] = decodeURIComponent(p[1].replace(/\+/g, ' '));
        }
    }
    return obj;
};

/**
 * detect css property
 *
 * @param {string} property 属性名
 * @param {string} value 属性值
 * @return {boolean} true / false
 *
 */
util.featureTest = function (property, value) {
    var prop = property + ':';
    var style = document.createElement('div').style;
    style.cssText = prop + ['-webkit-', '-moz-', '-ms-', '-o-', ''].join(value + ';' + prop) + value + ';';
    return style[property];
};

/**
 * 获取URL参数
 *
 * @return {Object}
 */
util.getUrlParams = function () {
    var query = window.location.search || '';
    query = query.replace('?', '');

    return util.qs.parse(query);
};

/**
 * 获取URL 指定参数
 *
 * @param {string} key 指定某key
 * @return {Object}
 */
util.params = function (key) {
    if (key === undefined) {
        return null;
    }

    var query = util.getUrlParams();

    return query[key] || null;
};


/**
 * decode HTML
 *
 * @param {string} source source
 * @return {string}
 */
util.decodeHTML = function (source) {
    var str = String(source)
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');

    // 处理转义的中文和实体字符
    return str.replace(/&#([\d]+);/g, function (_0, _1) {
        return String.fromCharCode(parseInt(_1, 10));
    });
};


/**
 * 处理富文本
 *
 * @param {string} content html
 * @return {string} 内容
 */
util.formatRichText = function (content) {
    return content
            .replace(/(\n)/g, '')
            .replace(/(\t)/g, '')
            .replace(/(\r)/g, '')
            .replace(/<\/?[^>]*>/g, '')
            .replace(/\s*/g, '');
};

/**
 * ---
 *
 * @param {Array} arr,
 * @param {string} key,
 * @param {string} keyVal,
 * @return {string} 内容
 */
util.getObject = function (arr, key, keyVal) {

    var temp = null;

    arr.forEach(function (item) {
        if (item[key] === keyVal) {
            temp = item;
        }
    });

    return temp;
};

util.JSON = {};

/**
 * JSON 字符串转对象
 *
 * @param {string} str json 字符串
 * @return {Object} json
 */
util.JSON.parse = function (str) {
    return (new Function('var obj=' + str + ';return obj'))();
};

util.JSON.stringify = JSON.stringify;

/**
 * 为类型构造器建立继承关系
 *
 * @param {Function} subClass 子类构造器
 * @param {Function} superClass 父类构造器
 * @return {Object} data
 */
util.inherits = function (subClass, superClass) {
    // by Tangram 1.x: baidu.lang.inherits
    var Empty = function () {
    };
    Empty.prototype = superClass.prototype;
    var selfPrototype = subClass.prototype;
    var proto = subClass.prototype = new Empty();

    for (var key in selfPrototype) {
        if (selfPrototype.hasOwnProperty(key)) {
            proto[key] = selfPrototype[key];
        }
    }
    subClass.prototype.constructor = subClass;
    subClass.superClass = superClass.prototype;

    return subClass;
};

/**
 * 对手机号码星号加密
 *
 * @param {string} phoneNum 要加密的手机号
 * @return {string} encoded data
 */
util.phoneEncode = function (phoneNum) {
    return phoneNum.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};


/**
 * 格式化日期
 *
 * @param {string} date, 日期的时间戳
 * @param {boolean} needTime, 是否需要时分
 * @return {string} 格式化后的日期
 */
util.dateformat = function (date, needTime) {
    var tDate = new Date(date);
    date = [];

    date.push(tDate.getFullYear());
    date.push(formatter(tDate.getMonth() + 1));
    date.push(formatter(tDate.getDate()));
    date = date.join('-');

    if (needTime) {
        var hour = formatter(tDate.getHours());
        var min = formatter(tDate.getMinutes());
        return date + ' ' + hour + ':' + min;
    }
    return date;

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
};

/**
 * 当前时间戳
 *
 * @return {Date} new date
 */
util.now = function () {
    return new Date().getTime();
};

/**
 * 将时间戳修正为东八区
 *
 * @param {Date} time date 时间戳
 * @return {Date} new date
 */
util.fixTimeZone = function (time) {
    return new Date(time - (-480 - (new Date()).getTimezoneOffset()) * 60 * 1000);
};

// util.getDisplayDate = function (date) {
//     if (!date) {
//         return '';
//     }
//     if (typeof date === 'number') {
//         date = new Date(date);
//     }
//     return date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日';
// };

/**
 * 获取 time 距离当前时间的天数
 *
 * @param  {Interge} date1 时间戳 1
 * @param  {Interge} date2 时间戳 2
 * @return {number} 返回格式化后的文本
 */
util.dateDiff = function (date1, date2) {
    date2 = date2 || util.now();

    date1 = new Date(date1).setHours(0, 0, 0, 0);
    date2 = new Date(date2).setHours(0, 0, 0, 0);

    return (date1 - date2) / 86400000;
};


/**
 * 获取时间戳距离当前时间有多久的文案
 *
 * @param {number} date 要处理的事件戳
 * @param {number} now 当前时间戳
 * @return {string} 事件间隔的文案
 */
util.formatDateToNow = function (date, now) {

    if (!date) {
        return '';
    }

    if (!now) {
        now = util.fixTimeZone(new Date()).getTime();
    }

    var diff = now - date;
    // error
    if (diff < 0) {
        return null;
    }
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
    return '更新时间 ' + util.dateformat(date, true);
};

module.exports = util;
