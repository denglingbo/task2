/**
 * @file phonePlugins.js
 * @author deo
 *
 * 手机端的一些公用脚本，和原生进行交互的中间层
 */

var util = require('./util');

var exports = {};

/**
 * 把 id 拼装成 jid
 *
 * @param {number} id, 不带@ 的id
 * @return {string} id@companyId
 *
 */
exports.makeJid = function (id) {
    var companyId = util.params('cid');
    return companyId !== null ? id + '@' + companyId : id;
};

/**
 * 把 jid 拆解为 id
 *
 * @param {number} jid, 带@ 的jid
 * @return {string} id
 *
 */
exports.takeJid = function (jid) {
    var jids = jid.split('@');
    return jids && jids.length === 2 ? jids[0] : jid;
};

/**
 * 合并为一个数组
 *
 * @param {Array|Object} param, 要合并的数组
 * @return {Array} 合并过的数组
 *
 */
exports.mergeArray = function (param) {
    var temp = [];

    if ($.isPlainObject(param)) {
        for (var key in param) {
            if (param.hasOwnProperty(key)) {
                temp.push(param[key]);
            }
        }
    }
    else if ($.isArray(param)) {
        temp = param;
    }
    else if (typeof param === 'number' || typeof param === 'string') {
        temp = [param];
    }
    else {
        return param;
    }

    var arr = [];

    temp.forEach(function (item) {
        if (typeof item === 'number' || typeof item === 'string') {
            arr.push(item);
        }
        if ($.isArray(item) && item.length > 0) {
            arr = arr.concat(item);
        }
    });

    return arr;
};

/**
 * 获取公共数据
 *
 * @param {Array} arr, id 数组
 * @return {deffered}
 *
 */
exports.getPubData = function (arr) {
    var me = this;
    var dfd = new $.Deferred();
    var jids = this.mergeArray(arr);

    if (!jids || jids.length <= 0) {
        dfd.reject(null);
        return dfd;
    }

    var jidArr = [];
    var dataFlag = 0;

    // 按原生需求拼接字符串
    jids.forEach(function (item) {
        jidArr.push(me.makeJid(item));
    });

    var options = {
        action: 'pubdata/userInfo',
        parameter: {
            jids: jidArr,
            dataFlag: parseInt(dataFlag, 2) || 0
        }
    };

    /* eslint-disable */
    CPPubData.getPubData(options, function (data) {
        if (!data) {
            dfd.reject(null);
        }
        else {
            // 模拟延迟
            setTimeout(function () {
                dfd.resolve(data);
            }, 100);
        }
    });
    /* eslint-enable */

    return dfd;
};

module.exports = exports;
