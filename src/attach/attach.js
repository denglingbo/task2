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

page.enter = function () {

};

page.deviceready = function () {
    var me = this;
    var attachList = me.attachData.objList;
    me.attach = AttachWrapper.initDetailAttach({
        attachData: attachList,
        container: '.attach-container'
    });

    navigation.left({
        click: function () {
            navigation.open(-1);
        }
    });
};

/**
 * 请求附件列表
 *
 * @param {deferred} dfd, deferred
 *
 */
page.addParallelTask(function (dfd) {
    var me = this;
    var promise = page.get(config.API.ATTACH_LIST, {
        taskId: util.params('taskId'),
        currPage: 1,
        number: util.params('total')
    });

    promise
        .done(function (result) {
            if (result.meta && result.meta.code !== 200) {
                dfd.reject(result);
            }
            else {
                me.attachData = result.data;
                dfd.resolve(me.attachData);
            }
        })
        .fail(function (err) {
            // console.log(err);
        });

    return dfd;
});

page.start();
