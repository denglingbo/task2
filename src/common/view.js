/**
 * @file view.js
 * @author deo (denglingbo@126.com)
 *
 * 模板相关
 *
 */

var Mustache = require('dep/mustache');

/**
 * Mustache
 *
 */
var View = function () {
    this.name = 'view';
};

/**
 * Mustache 渲染模板
 * 模板输出 dom $(selector), 模板源: selector'-template'
 *
 * @param {string} selector, #id|.class|tagname
 * @param {Object} data, 数据
 *
 */
View.prototype.render = function (selector, data) {
    var $elem = $(selector);
    var $temp = $(selector + '-template');

    if (!$elem.length || !$temp.length) {
        return;
    }

    var template = $temp.html();
    var html = Mustache.render(template, data);

    $elem.html(html);
};

module.exports = View;
