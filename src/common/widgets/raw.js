/**
 * @file raw.js
 * @author deo
 */

var lang = require('common/lang').getData();

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

module.exports = {

    status: function (key) {
        return statusMap[key] || '';
    },

    importance: function (key) {
        return importanceMap[key] || '';
    }
};
