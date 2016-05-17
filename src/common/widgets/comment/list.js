/* eslint-disable */
var config = require('common/util');
var tmpl = require('./list.tpl');
var users = require('common/middleware/user/users');
var util = require('common/util');
var AttachWrapper = require('common/middleware/attach/attachWrapper');

var Loader = require('common/ui/loader');

/**
 * 初始化 评论数据
 *
 * @param {Object} options, 配置
 */
var init = function (options) {

    var opts = {
        dataKey: 'obj_list',
        wrapper: '#comments-main',
        tpl: tmpl
    };

    $.extend(opts, options);

    var loader = new Loader(opts);

    var jids = [];

    loader.req(function (data) {

        // 时间展示
        data.dataRaw = function () {
            return util.formatDateToNow(this.op_time);
        };

        data.isOwner = function () {
            return this.user_id.toString() === users.uid.toString();
        };

        // 渲染组件
        this.render(data);

        bindEvents();

        /* eslint-disable */
        getUserAndPhoto(data.obj_list);
        /* eslint-enable */

        if (data.attachs && data.attachs.length > 0) {
            AttachWrapper.initDetailAttach({
                attachData: data.attachs,
                container: '.attach-container'
            });
        }
    });
};

/**
 * 获取人员信息
 *
 * @param {Array} arr, 后端数据 评论数组
 */
function getUserAndPhoto(arr) {
    if (!arr || arr.length <= 0) {
        return;
    }

    var jids = [];

    arr.forEach(function (item) {
        jids.push(item.user_id);
    });

    users.getUserAndPhoto(jids)

        .done(function (data) {
            if (data && data.length > 0) {
                render(data);
            }
        })
        .fail(function () {
        });
}

/**
 * 后渲染 人员信息
 *
 * @param {Array} arr, 后端数据 评论数组
 */
function render(data) {

    data.forEach(function (item) {

        var $item = $('#user-' + users.takeJid(item.jid));

        if ($item.length) {
            $item.find('.user-photo').html('<img src="' + item.base64 + '" />');
            $item.find('.user-name').html(item.name);
        }
    });
}

/**
 * 删除评论
 *
 * @param {string} id, user id
 */
function removeData(id) {
    console.log(id);
}

function bindEvents() {
    var $main = $('#comments-main');

    $main.on('click', '.delete', function () {
        var id = $(this).attr('target-id');

        removeData(id);
    });
}

module.exports = {
    init: init
};
