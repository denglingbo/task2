/**
 * @file util.js
 * @author deo
 * 工具包
 *
 */
var util = {};

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

module.exports = util;
