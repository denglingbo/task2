/**
 * @file lang.js
 * @author deo
 *
 * 语言包主函数, 该函数需要 language/index.js 作为配置入口
 * 根据 language/index.js 中的返回做成将要使用的 object
 */

var util = require('./util');
var langMap = require('./language/index');
var defaultLang = require('./language/zh_CN');

var Lang = function () {

    // 是否获取语言包失败
    this.failed = false;

    // 语言包类型
    this.type = util.getParam('lang');

    // 语言包数据
    this.data = null;

    var data = langMap[this.type];

    if (!data) {
        this.data = defaultLang;
        this.failed = true;
    }
    else {
        this.data = data;
    }
};

Lang.prototype = {

    getType: function () {
        return this.type;
    },

    isFailed: function () {
        return this.failed;
    },

    getData: function () {
        return this.data;
    }

    /*
    parse: function (tmpl) {
        var me = this;

        tmpl = tmpl.replace(/{{lang\.(\w+)}}/g, function (w, d) {

            if (me.data[d]) {
                return me.data[d];
            }

            return '';
        });

        return tmpl;
    }
    */
};

module.exports = new Lang();
