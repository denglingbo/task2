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
var view = {};

/**
 * Mustache 渲染模板
 * 模板输出 dom $(selector), 模板源: selector'-template'
 *
 * @param {string} selector, #id|.class|tagname
 * @param {Object} data, 数据
 * @param {string} appendType, append, befre, after, ..., 默认值为 html
 * @return {string} html 片段
 *
 */
view.render = function (selector, data, appendType) {
    var $elem = $(selector);
    var $temp = $(selector + '-template');
    var type = appendType || 'html';

    if (!$elem.length || !$temp.length) {
        return;
    }

    var template = $temp.html();
    var html = Mustache.render(template, data);

    $elem[type](html);

    return html;
};


/**
 * 根据模板获取renderer函数
 *
 * @param {string} template 模板
 */
view.getRenderer = function (template) {
    Mustache.parse(template);
};

module.exports = view;
