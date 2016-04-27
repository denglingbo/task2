/**
 * @file detail.js
 * @author deo
 *
 * 详情页公共包
 * 处理 任务详情页，事件详情页，讨论详情页
 *
 */
var util = require('../../util');

var exports = {};

// 状态显示
var statusMap = {
    1: '已完成',
    2: '已撤销',
    3: '进行中',
    4: '待接收',
    5: '指派中',
    6: '审核中',
    7: '已拒绝'
};

// 紧要程度
var importanceMap = {
    1: '紧急',
    2: '尽快完成',
    3: '提早完成',
    4: '普通'
};

exports.statusMap = statusMap;
exports.importanceMap = importanceMap;

/**
 * 初始化 Page 基本数据
 *
 * @param {Object} result, 处理详情页初始数据
 * @return {Object}
 */
exports.dealPageData = function (result) {

    if (result.meta && result.meta.code !== 200) {
        return null;
    }

    var data = result.data;

    // 时间展示
    data.updateDateRaw = util.formatDateToNow(data.op_time);

    data.content = util.formatRichText(data.content);

    data.statusText = (function () {
        return statusMap[data.status] || '';
    })();

    data.importanceRaw = importanceMap[data.importance_level];

    data.creator = '';
    data.principal = data.principal_user;
    data.partnerRaw = data.attend_ids;

    return data;
};

/**
 * 展示、操作 权限
 *
 * @param {Object} rights, 后端权限数据
 */
exports.rightsView = function (rights) {};

module.exports = exports;
