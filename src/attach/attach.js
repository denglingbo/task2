/**
 * @file attach.js
 * @author hefeng
 * 附件列表页
 *
 */

require('./attach.scss');

var config = require('../config');
var Page = require('common/page');
var AttachWrapper = require('common/middleware/attach/attachWrapper');
var util = require('common/util');
var navigation = require('common/middleware/navigation');
var page = new Page();

var pageType = util.params('page');
var type = util.params('type');

// 获取加载信息
var getAjaxData = {
    task: function () {
        if (!type) {
            return;
        }
        var data = {
            data: {
                taskId: util.params('taskId')
            }
        };
        if (type === 'attachs') {
            data.api = config.API.ATTACH_LIST;
            data.data.currPage = 1;
            data.data.number = util.params('total');
        }
        else {
            data.api = config.API.TASK_DETAIL_URL;
        }
        return data;
    },
    talk: function () {
        var data = {
            data: {
                talkId: util.params('talkId')
            }
        };
        data.api = config.API.TALK_DETAIL_URL;
        return data;
    },
    affair: function () {
        var data = {
            data: {
                affairId: util.params('affairId')
            }
        };
        data.api = config.API.AFFAIR_DETAIL_URL;
        return data;
    }
};

// 获取附件数据
var getAttachData = {
    task: function () {
        if (!type || !page.data) {
            return;
        }
        var data = [];
        if (type === 'attachs') {
            data = page.data.objList;
        }
        else {
            data = page.data.summaryAttachs;
        }
        return data;
    },
    talk: function () {
        if (!type || !page.data) {
            return;
        }
        var data = [];
        if (type === 'attachs') {
            data = page.data.attachs;
        }
        else {
            data = page.data.summaryAttachs;
        }
        return data;
    },
    affair: function () {
        if (!type || !page.data) {
            return;
        }
        var data = page.data.attachs;
        return data;
    }
};

page.enter = function () {

};

page.deviceready = function () {
    var me = this;
    var attachList = getAttachData[pageType]();
    me.initAttach(attachList);

    navigation.left({
        click: function () {
            navigation.open(-1);
        }
    });
};

/**
 * 初始化附件
 *
 * @param {Object} data, 附件数据
 */
page.initAttach = function (data) {
    if (!data || !data.length) {
        return;
    }
    AttachWrapper.initDetailAttach({
        attachData: data,
        container: '.attach-container'
    });
};

/**
 * 请求附件列表
 *
 * @param {deferred} dfd, deferred
 *
 */
page.addParallelTask(function (dfd) {
    if (!pageType) {
        dfd.reject();
        return;
    }
    var me = this;
    var ajaxData = getAjaxData[pageType]();
    if (!ajaxData) {
        dfd.reject();
        return;
    }
    var promise = page.get(ajaxData.api, ajaxData.data);

    promise
        .done(function (result) {
            if (result.meta && result.meta.code !== 200) {
                dfd.reject(result);
            }
            else {
                me.data = result.data;
                dfd.resolve(me.data);
            }
        })
        .fail(function (err) {
            // console.log(err);
        });

    return dfd;
});

page.start();
