/* eslint-disable */
var tmplList = require('./list.tpl');
var tmplMsg = require('./msg.tpl');
var users = require('common/middleware/user/users');
var util = require('common/util');
var AttachWrapper = require('common/middleware/attach/attachWrapper');

var Loader = require('common/ui/loader');

/**
 * 初始化 评论数据
 *
 * @param {Page} page, new Page
 * @param {Object} options, 配置
 */
var fn = function (page, options) {

    this.opts = {
        dataKey: 'obj_list',
        wrapper: '#comments-main',
        tpl: tmplList,
        partials: {
            msg: tmplMsg
        },
        API: {},
        data: null
    };

    $.extend(this.opts, options);

    this.page = page;
    this.data = this.opts.data;
    this.$main = $(this.opts.wrapper);

    this.loader = new Loader(this.opts);
    this.loader.req(function (data) {

        if (!data) {
            return;
        }

        // 时间展示
        data.dataRaw = function () {
            return util.formatDateToNow(this.op_time);
        };

        data.isOwner = function () {
            return this.user_id.toString() === users.uid.toString();
        };

        // 渲染组件
        this.render(data);

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

    this.bindEvents();
};

$.extend(fn.prototype, {

    bindEvents: function () {
        var me = this;
        var $main = $('#comments-main');

        $main.on('click', '.delete', function () {

            me.removeData(this);
        });

        $('.send').on('click', function () {
            me.addComment();
        });
    },

    /**
     * 删除评论
     *
     * @param {string} id, user id
     */
    removeData: function (target) {

        var $target = $(target);
        var id = $target.data('id');
        var uid = $target.data('uid');
        var $item = $('#user-' + uid);

        var promise = this.page.post(this.opts.API.delete, {
            id: id
        });

        promise
            .done(function (data) {

                if (!data) {
                    return;
                }

                if (data.meta.code === 200) {
                    $item.addClass('hide');
                }
                else {

                }
            })
            .fail(function (err) {
                
            });
    },

    /**
     * 添加评论
     */
    addComment: function () {
        var $content = $('.editable');
        var text = $content.text();
        var $null = $('.list-null');

        var promise = this.page.post(this.opts.API.add, {
            // 0 代表新增评论
            id: 0,
            module_id: this.data.id,
            content: text,
            message: {
                'sent_eim': true,
                'sent_emai': false,
                'sent_sms': false
            },
            // 附件暂时为空
            attachements: []
        });



        promise
            .done(function (data) {

                if (!data) {
                    return;
                }

                // 添加成功
                if (data.meta.code === 200) {
                }
                else {

                }
            })
            .fail(function (err) {
                
            });
    }
});

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

module.exports = fn;
