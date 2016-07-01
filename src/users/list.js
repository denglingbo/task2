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
var navigation = require('common/middleware/navigation');
var page = new Page();

page.deviceready = function () {
    var me = this;

    navigation.left({
        click: function () {
            navigation.open(-1);
        }
    });

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

page.start();
