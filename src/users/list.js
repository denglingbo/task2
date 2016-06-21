/**
 * @file list.js
 * @author deo
 *
 * 人员列表页
 */

require('./list.scss');

var util = require('../common/util');
var users = require('common/middleware/users/users');
var Page = require('common/page');
var page = new Page();

// page.enter = function () {
//     this.render('#users-list', this.data);
// };

page.deviceready = function () {
    var me = this;
    var lang = me.lang;

    /* eslint-disable */
    CPNavigationBar.setLeftButton({
        title: lang.back,
        iconPath: '',
        callback: function () {
            CPNavigationBar.returnPreviousPage();
        }
    });
    /* eslint-enable */

    var jids = util.params('jids');

    users.getUserAndPhoto(jids)
        .done(function (data) {
            me.render('#users-list', {
                list: data
            });
        })
        .fail(function (err) {

        });
};

/**
 * 这里虽然莫有请求页面接口，但是还是按常规请求来处理
 *
 * @param {deferred} dfd, deferred
 *
 */
// page.addParallelTask(function (dfd) {
//     var me = this;
//     var jids = util.params('jids');

//     users.getUserAndPhoto(jids)
//         .done(function (data) {
//             me.data = {
//                 list: data
//             };

//             dfd.resolve();
//         })
//         .fail(function () {
//             dfd.reject();
//         });

//     return dfd;
// });

page.start();
