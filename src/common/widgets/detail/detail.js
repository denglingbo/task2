/**
 * @file detail.js
 * @author deo
 *
 * 详情页公共包
 * 处理 任务详情页，事件详情页，讨论详情页
 *
 */
var users = require('common/middleware/user/users');
// var util = require('common/util');
var lang = require('common/lang').getData();
var raw = require('common/widgets/raw');

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
    1: lang.impLevel1,
    2: lang.impLevel2,
    3: lang.impLevel3,
    4: lang.impLevel4
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
    data.updateDateRaw = function () {
        return raw.formatDateToNow(this.opTime);
    };

    data.statusRaw = function () {

        var status = this.status;

        if (this.suspend) {
            status = 7;
        }

        return raw.status(status, this.endTime);
    };

    data.importanceRaw = function () {
        return raw.importance(this.importanceLevel);
    };

    data.isMaster = 0;

    // 负责人到完成任务页面有备注信息填写
    // 判断这个用户点击完成任务过去的页面的展示权限
    if (users.uid() === data.principalUser) {
        data.isMaster = 1;
    }

    data.creator = '';
    data.principal = data.principalUser;
    data.partnerRaw = data.attendIds;

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
        if (item.type === 2) {
            item.typeRaw = lang.talk;
            item.pageType = 'talk';
        }
        if (item.type === 3) {
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
