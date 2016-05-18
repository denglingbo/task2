/**
 * @file log.js
 * @author deo
 *
 * 日志
 */

var config = require('../config');
var util = require('./util');

window.onerror = function (err, url, lineno) {

    // 如果发生错误，则把错误信息打到日志里面
    /* eslint-disable */
    send({
        'da_src': 'err: ' + err + ' url: ' + url + ' lineno: ' + lineno,
        'da_act': 'error'
    });
    /* eslint-enable */
};

var pro = document.location.protocol;

/**
 * 日志服务器 url
 *
 * @type {String}
 */
var LOG_URL = config.debug
    ? pro + '//task2.test1.com:8014/common/img/error.png'
    : pro + '//xx.gif';

/**
 * 默认参数
 */
var defaultOpts = {
    uid: util.getParam('uid')
};

// 存储发送队列
var queue = [];

/**
 * 日志发送
 *
 * @param  {Object} opts 日志参数对象
 */
function send(opts) {

    // 添加到队列
    queue.push(opts);

    // 开始消费
    consume();
}

/**
 * 根据队列中所存储的任务来发送
 */
function consume() {
    if (queue.length === 0) {
        return;
    }

    function execLog(params) {
        params = $.extend({}, defaultOpts, params || {});

        if (config.debug) {
            /* eslint-disable */
            // console.info('LOGGER: ', params.da_act, params.da_src, params.referer);
            console.log(params);
            /* eslint-enable */
            return;
        }

        var q = util.qs.stringify(params);

        var t = Date.now() + '' + Math.ceil(Math.random() * 10000);

        var url = LOG_URL + '?t=' + t  + '&' + q;

        var img = new Image();
        var key = 'img' + Date.now() + Math.ceil(Math.random() * 100);
        window[key] = img;
        img.onload = img.onerror = function () {
            delete window[key];
        };
        img.src = url;
    }

    var params;

    while (params = queue.pop()) {
        execLog(params);
    }
}

/**
 * 解析节点获得日志参数
 *
 * @param  {HTMLElement} ele 文档节点
 * @return {Object|undefined}  解析后的日志参数
 */
function parseLogData(ele) {
    var log = $(ele).data('log');
    var params = {};

    if (typeof log === 'string') {
        try {
            log = util.decodeHTML(log);
            log = util.JSON.parse(log);
        }
        catch (e) {
            log = {};
        }
    }

    if (typeof log === 'object') {
        var value;
        for (var key in log) {
            if (!log.hasOwnProperty(key)) {
                continue;
            }
            value = log[key];
            if (log.hasOwnProperty(key)) {
                if (typeof value === 'object') {
                    value = JSON.stringify(value);
                }
            }
            if (value) {
                params[key] = value.toString();
            }
        }

        /* eslint-disable fecs-camelcase */
        params.da_act = params.da_act || 'click';
        /* eslint-enable fecs-camelcase */

        return params;
    }
}

/**
 * 获取元素 index
 *
 * @param {HTMLElement} element dom元素对象
 * @return {number}
 */
function getIndex(element) {
    var prevSiblings = [];
    var prevSibling = element;
    var i = 0;
    while (prevSibling = prevSibling.previousSibling) {
        if (prevSibling.tagName === element.tagName) {
            prevSiblings[i++] = prevSibling;
        }
    }
    return prevSiblings.length;
}

/**
 * 获取 selector
 *
 * @param {HTMLElement} target dom元素对象
 * @param {string} appendInfo, 附加信息
 * @return {string}
 */
// function getSelector(target, appendInfo) {
//     try {
//         var s = '';

//         if (target.id) {
//             s = '#' + target.id;
//         }
//         else if (target.className) {
//             // 为了避免太多，这里只取第一个
//             s = '.' + target.className.split(' ')[0];
//         }

//         return (appendInfo || '') + s;
//     }
//     catch (ex) {}
// }

/**
 * 获取元素的Xpath
 *
 * @param  {HTMLElement} target dom元素对象
 * @return {string}  xpath字符串
 */
function getXpath(target) {

    var path = [];
    var index = 0;

    while (target && target !== document.body) {

        var hasSiblings = !!$(target).siblings(target.tagName.toLowerCase()).length;

        var targetIndex = getIndex(target);

        path[index++] = target.tagName.toLowerCase() + (hasSiblings ? '[' + targetIndex + ']' : '');

        target = target.parentNode;

    }

    path.reverse();

    return '/html/body/' + path.join('/');
}

/**
 * 发送pv日志
 *
 * @param  {Object} opts 日志参数对象
 * @param {boolean} appendPageId 是否补上页面id，这个在手动发pv的时候可能会用上
 */
function sendPv(opts, appendPageId) {
    /* eslint-disable */
    opts = $.extend({'da_act': 'ready'}, opts || {});
    /* eslint-enable */
    send(opts);
}

/**
 * 初始化参数，传入页面的名称
 *
 * @param  {string} pageName 必填，来源标识，即页面标识
 */
function init(pageName) {

    /* eslint-disable fecs-camelcase */
    defaultOpts.da_src = pageName || '';
    /* eslint-enable fecs-camelcase */

    // 发送PV日志, 如果不设置pageName则不主动发pv日志
    pageName && sendPv();

    // 绑定事件到含有 data-log的节点
    $(document.body).on('click', '[data-log]', function (e) {
        var params = parseLogData(this);
        params.xpath = getXpath(this);
        send(params);
    });
}

module.exports = {
    init: init,
    send: send,
    sendPv: sendPv
    // addDefaultParams: addDefaultParams
};