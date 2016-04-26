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
    return companyId !== null ? id + '@' + companyId : null;
};

/**
 * 把 jid 拆解为 id
 *
 * @param {number} jid, 带@ 的jid
 * @return {string} id
 *
 */
exports.takeJid = function (jid) {
    var jids = jid.toString().split('@');
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
 * 封装原生接口 改为 deferred
 * 获取公共数据 统一 入口
 *
 * @param {Object} options, 原生配置
 * @return {Deferred}
 *
 */
exports.getPubData = function (options) {
    var dfd = new $.Deferred();

    /* eslint-disable */
    CPPubData.getPubData(options, function (data) {
        if (!data || data.code !== 0) {
            dfd.reject(null);
        }
        else {
            // 模拟延迟
            setTimeout(function () {
                dfd.resolve(data.rel);
            }, 100);
        }
    });
    /* eslint-enable */

    return dfd;
};

/**
 * 获取公共数据 - 指定人员信息
 *
 * @param {Array} jids, id 数组
 * @param {number} dataFlag, 获取数据内容的标识
 * @return {Deferred}
 *
 */
exports.getUserInfo = function (jids, dataFlag) {
    var me = this;

    if (!jids || jids.length <= 0) {
        return null;
    }

    var jidArr = [];

    // 按原生需求拼接字符串
    jids.forEach(function (item) {
        jidArr.push(me.makeJid(item));
    });

    if (dataFlag !== undefined) {
        dataFlag = parseInt(dataFlag, 10);

        if (isNaN(dataFlag)) {
            dataFlag = 0;
        }
    }

    var options = {
        action: 'pubdata/userInfo',
        parameter: {
            jids: jidArr,
            dataFlag: dataFlag
        }
    };

    return this.getPubData(options);
};


/**
 * 获取公共数据 - 指定人员头像，简直有点坑啊，要一次次的请求
 *
 * @param {Array} jids, id 数组
 * @return {Deferred}
 *
 */
exports.getUserIcon = function (jids) {
    var me = this;
    var dfd = new $.Deferred();
    var arr = jids;

    if (!$.isArray(jids)) {
        arr = jids.split(',');
    }

    // promise 队列
    var promiseList = [];

    arr.forEach(function (id) {
        var jid = me.makeJid(id);

        if (jid !== null) {

            var fn = me.getPubData({
                action: 'pubdata/contactIcon',
                parameter: {
                    jid: jid,
                    isUpdate: 0
                }
            });

            promiseList.push(fn);
        }
    });

    $.when.apply($, promiseList)
        .done(function () {
            // 获取整个promise 的返回
            var args = arguments;

            dfd.resolve(args);
        })
        .fail(function () {
            dfd.reject(null);
        });

    return dfd;
};


module.exports = exports;
