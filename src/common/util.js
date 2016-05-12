/**
 * @file util.js
 * @author deo
 * 工具包
 *
 */
var util = {};

/**
 * vendor
 */
var elementStyle = document.createElement('div').style;
util.vendor = function () {
    var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'];
    var transform;
    var len = vendors.length;

    for (var i = 0; i < len; i++) {
        transform = vendors[i] + 'ransform';
        if (transform in elementStyle) {
            return vendors[i].substr(0, vendors[i].length - 1);
        }
    }

    return false;
};

/**
 * 获取当前浏览器下的 css3 key
 *
 * @param {string} style, 样式名 transform, ...
 * @return {string}, 当前浏览器下的样式名
 *
 */
util.prefixStyle = function (style) {
    var vendor = this.vendor();
    if (vendor === false) {
        return false;
    }
    if (vendor === '') {
        return style;
    }
    return vendor + style.charAt(0).toUpperCase() + style.substr(1);
};

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
 * 获取数组中的指定JSON 对象
 *
 * @param {Array} arr, 数组 [{}, {}, ...]
 * @param {string} key, 某个 key
 * @param {string} val, key 对应的值
 * @return {Object} 匹配到的对象
 */
util.findObjectByArray = function (arr, key, val) {

    var temp = null;

    if (!arr || !$.isArray(arr)) {
        return temp;
    }

    arr.forEach(function (item) {
        if (item[key] && item[key] === val) {
            temp = item;
        }
    });

    return temp;
};

/**
 * 格式化数据 如1000->1k 1024->1k 1230->1.2k
 *
 * @param  {number} number 要fix的数据
 * @param  {number} basicNum 基准单位如1000
 * @param  {string} unitName 单位名称如'k'
 * @param  {number} maxDecimalCount 最多保留几位小数
 * @return {number}
 */
util.fixNum = function (number, basicNum, unitName, maxDecimalCount) {

    if (!number) {
        return '';
    }
    basicNum = basicNum || 1000;
    if (number < basicNum) {
        return number;
    }

    unitName = unitName || 'k';
    maxDecimalCount = maxDecimalCount || 1;

    var res = number / basicNum;

    if (/\./.test(res)) {
        res = '' + res;
        var decimalIndex = res.indexOf('.');
        // 保留n未小数
        res = res.slice(0, decimalIndex + maxDecimalCount + 1);
        // 把结尾的.0 .00 或者是1.90的无效小数点和0去掉
        res = res.replace(/\.?0*$/g, '');
    }

    return res + 'k';
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
 * generate uuid
 *
 * @return {string}
 */
util.guid = function () {
    // refer to http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0;
        var v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

/**
 * 为类型构造器建立继承关系
 *
 * @param {Function} subClass 子类构造器
 * @param {Function} superClass 父类构造器
 * @return {Object} data
 */
util.inherits = function (subClass, superClass) {
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

/**
 * 转换string驼峰
 *
 * @param {string} str, 需要转换的字符串
 * @return {string} 转换后的驼峰命名
 */
util.camelCase = function (str) {
    return str.replace(/_+(.)?/g, function (str, e) {
        return e ? e.toUpperCase() : '';
    });
};

/**
 * 附件data传入 key转为 camelCase
 *
 * @param {Array} arr, 附件传入data.attachements
 * @return {Array}, 属性转换成驼峰命名的对象的集合
 */
util.transKey = function (arr) {
    var newArr = [];
    var me = this;
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
                newObj[me.camelCase(key)] = item[key];
            }
        }
        outArr.push(newObj);
    }
    return outArr;
};

/**
 * 数组浅层次clone
 *
 * @param {Array} arr, 需要clone的数组
 * @return {Array} clone的数组
 */
util.arrClone = function (arr) {
    var newArr = [];
    arr.forEach(function (value) {
        newArr.push(value);
    });
    return newArr;
};

/**
 * 把ms转换为 yyyy年MM月dd日的格式
 *
 * @param {number} ms 时间毫秒
 * @return {string} 返回的时间字符串
 */
util.formatTime = function (ms) {
    var time = new Date(ms);
    var y = time.getFullYear();
    var M = time.getMonth() + 1;
    var d = time.getDate();
    M = M < 10 ? '0' + M : M;
    d = d < 10 ? '0' + d : d;
    return y + '年' + M + '月' + d + '日';
};

/**
 * 比较两个数组的值是否相等
 *
 * @param {Array} arr1, 数组1
 * @param {Array} arr2, 数组2
 * @return {boolean} 是否相等
 */
util.compareArr = function (arr1, arr2) {
    var newArr1 = this.arrClone(arr1).sort();
    var newArr2 = this.arrClone(arr2).sort();
    var isDiff = newArr1.some(function (value, index) {
        return value !== newArr2[index];
    });
    return isDiff;
};

/**
 * 从另一个对象获取与当前对象的属性相同的值
 *
 * @param {Object} target, 被赋值的对象
 * @param {Object} source, 源对象
 *
 */
util.getDataFromObj = function (target, source) {
    for (var key in target) {
        if (target.hasOwnProperty(key)) {
            target[key] = source[key] ? source[key] : target[key];
        }
    }
};

/**
 * 从选人组件返回数据获取人员名
 *
 * @param {Array} arr, 选人组件返回的contacts
 * @return {string}, 人员字符串
 *
 */
util.getPersonsName = function (arr) {
    var nameArr = [];
    arr.forEach(function (item) {
        nameArr.push(item.name);
    });
    return nameArr.join('、');
};

module.exports = util;
