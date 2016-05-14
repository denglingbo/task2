/**
 * @file detail.js
 * @author deo
 *
 * 详情页公共包
 * 处理 任务详情页，事件详情页，讨论详情页
 *
 */
var users = require('common/middleware/user/users');
var util = require('common/util');
var lang = require('common/lang').getData();

var detail = {};

// 状态显示
var statusMap = {
    1: lang.doneText,
    2: lang.cancelText,
    3: lang.doingText,
    4: lang.receivedText,
    5: lang.assignmentText,
    6: lang.reviewText,
    7: lang.refuseText
};

// 紧要程度
var importanceMap = {
    1: '紧急',
    2: '尽快完成',
    3: '提早完成',
    4: '普通'
};

detail.statusMap = statusMap;
detail.importanceMap = importanceMap;

/**
 * 初始化 Page 基本数据
 *
 * @param {Object} result, 处理详情页初始数据
 * @return {Object}
 */
detail.dealPageData = function (result) {

    if (result.meta && result.meta.code !== 200) {
        return null;
    }

    var data = result.data;

    // 时间展示
    data.updateDateRaw = util.formatDateToNow(data.op_time);

    // data.content = util.formatRichText(data.content);

    data.statusText = (function () {
        return statusMap[data.status] || '';
    })();

    data.importanceRaw = importanceMap[data.importance_level];

    data.isMaster = 0;

    // 负责人到完成任务页面有备注信息填写
    // 判断这个用户点击完成任务过去的页面的展示权限
    if (users.uid() === data.principal_user) {
        data.isMaster = 1;
    }

    data.creator = '';
    data.principal = data.principal_user;
    data.partnerRaw = data.attend_ids;

    return data;
};

/**
 * format 事件 讨论 列表的数据格式
 *
 * @param {Array} arr, 列表数据
 * @return {Array|null}
 */
detail.getEventTalkList = function (arr) {

    if (!arr || arr.length <= 0) {
        return null;
    }

    var list = [];

    arr.forEach(function (item) {
        if (item.type === 1) {
            item.typeRaw = lang.talk;
            item.pageType = 'talk';
        }
        if (item.type === 2) {
            item.typeRaw = lang.affair;
            item.pageType = 'affair';
        }

        list.push(item);
    });

    return list;
};

/**
 * 展示、操作 权限
 *
 * @param {Object} rights, 后端权限数据
 */
detail.rightsView = function (rights) {};

module.exports = detail;
