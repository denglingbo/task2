/**
 * @file template.js
 * @author deo
 *
 * 模版
 */

var exports = {};

/**
 * 获取重载的 dom 节点
 *
 * @param {Object} classObject, reload 的样式配置
 * @param {Object} lang, lang
 * @return {string} html string
 */
exports.reload = function (classObject, lang) {

    var c = {};
    var obj = classObject.reload;

    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            c[key] = obj[key].replace(/^\./, '');
        }
    }

    return '<div class="data-reload-tips ' + c.default + ' hide">' + lang.default + '</div>'
        + '<div class="' + c.holder + ' hide">' + lang.holder + '</div>'
        + '<div class="' + c.process + ' hide">' + lang.process + '</div>'
        + '<div class="' + c.fail + ' hide">' + lang.fail + '</div>'
        + '<div class="' + c.unchanged + ' hide">' + lang.unchanged + '</div>'
        + '<div class="' + c.done + ' hide">' + lang.done + '</div>';
};

var isApple = function () {
    var appVersion = navigator.userAgent;
    return appVersion && (/(iphone|ipad)/i).test(appVersion);
};

/**
 * 获取加载条的 dom 节点
 *
 * @param {Object} classObject, more 的样式配置
 * @param {Object} lang, lang
 * @return {string} html string
 */
exports.more = function (classObject, lang) {

    var c = {};
    var obj = classObject.more;

    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            c[key] = obj[key].replace(/^\./, '');
        }
    }

    return '<span class="' + c.default + ' hide">' + lang.default + '</span>'
        + '<span class="' + c.process + ' hide">'
            + '<div class="loading-status">'
                + (isApple() ? '<span class="loading"></span>' : '')
                + '<span class="loading-text">' + lang.process + '</span>'
            + '</div>'
        + '</span>'
        + '<span class="' + c.done + ' hide">' + lang.done + '</span>'
        + '<span class="' + c.max + ' hide">' + lang.max + '</span>'
        + '<span class="' + c.nodata + ' hide">' + lang.nodata + '</span>'
        + '<span class="' + c.fail + ' hide">' + lang.fail + '</span>';
};

module.exports = exports;
