/* eslint-disable */
var tmplItem = require('./item.tpl');
var Pharos = require('common/ui/pharos');
var users = require('common/middleware/users/users');
var util = require('common/util');
var raw = require('common/widgets/raw');
var AttachWrapper = require('common/middleware/attach/attachWrapper');
var DataLoader = require('common/ui/dataLoader/dataLoader');

function dealData(data, page) {
    // 时间展示
    data.dataRaw = function () {
        return raw.formatDateToNow(this.opTime);
    };

    // 判断是否是评论所有者
    data.isOwner = function () {
        var uid = users.uid();

        if (this.userId && uid) {
            return this.userId.toString() === uid.toString();
        }

        return false;
    };

    data.lang = page.lang;
}

function getJids(arr, key) {
    var jids = [];
    for (var i = 0; i < arr.length; i ++) {
        var item = arr[i][key];

        if (item && $.inArray(item, jids) === -1) {
            jids.push(item);
        }
    }

    return jids;
}

var renderUser = function ($layout, objList) {
    var me = this;

    if (objList.length <= 0) {
        return;
    }

    var jids = getJids(objList, 'userId');

    var dfdPub = users.getUserAndPhoto(jids);

    dfdPub
        .done(function (pubData) {

            if (pubData) {

                new Pharos($layout, {list: pubData});
            }
            else {
                // me.failUser();
            }
        })
        .fail(function () {
            // me.failUser();
        });


    objList.forEach(function (item) {
        var $item = $('#item-' + item.id);

        if (item.attachs && item.attachs.length > 0) {
            AttachWrapper.initDetailAttach({
                attachData: item.attachs,
                container: '.comments-attach-' + item.id
            });
        }
    });
};

/**
 * 初始化 评论数据
 *
 * @param {Page} page, new Page
 * @param {Object} options, 配置
 */
var fn = function (page, options) {
    var me = this;

    me.opts = {
        dataKey: 'objList',
        wrapper: '#comments-main',
        API: {},
        data: null
    };

    $.extend(me.opts, options);

    me.page = page;
    me.data = me.opts.data;
    me.$main = $(me.opts.wrapper);

    me.$listNull = $('.list-null');

    // 初始化一个点击加载组件
    me.dataLoader = new DataLoader({
        loadType: 0,
        tpl: tmplItem,
        wrapper: me.$main,
        promise: me.opts.promise,
        // 后端数据节点位置
        dataKey: me.opts.dataKey,
        pageNum: 10
    });

    me.dataLoader.on('more', function (data) {

        dealData(data, me.page);

        var total = data.total || 0;
        $('.comment-total').html('(' + total + ')');

        this.render(data, 'append');

        renderUser(me.$main, data.objList);

        if (!me.isComments()) {
            me.$listNull.removeClass('hide');
        }

    });

    this.bindEvents();
};

$.extend(fn.prototype, {

    isComments: function () {
        return this.$main.find('dd').not('.list-null').length;
    },

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
        var me = this;
        var $target = $(target);
        var id = $target.data('id');
        // var uid = $target.data('uid');

        var promise = this.page.post(this.opts.API.delete, {
            commentId: id
        });

        promise
            .done(function (result) {

                if (!result) {
                    return;
                }

                if (result.meta.code === 200) {
                    $('#item-' + id).addClass('hide').remove();
                }
                else {

                }
            })
            .fail(function (err) {
                
            })
            // 判断是否一条数据都没有了
            .always(function () {
                var len = me.$main.find('dd').not('.list-null').length;

                if (len <= 0) {
                    me.$listNull.removeClass('hide');
                }
                else {
                    me.$listNull.addClass('hide');
                }
            });
    },

    /**
     * 添加评论
     */
    addComment: function () {
        var me = this;
        var $content = $('.editable');
        var text = $content.text();
        var $null = $('.list-null');

        var promise = me.page.post(me.opts.API.add, {
            // 0 代表新增评论
            id: 0,
            moduleId: me.data.id,
            content: text,
            message: {
                'sentEim': true,
                'sentEmai': false,
                'sentSms': false
            },
            // 附件暂时为空
            attachements: []
        });

        promise
            .done(function (result) {

                if (!result) {
                    return;
                }

                // 添加成功
                if (result.meta.code === 200) {

                    // 共用 ./item.tpl
                    var data = {
                        objList: [result.data]
                    };

                    dealData(data, me.page);

                    me.page.render($('.comments dd').eq(0), data, {
                        tmpl: tmplItem,
                        type: 'before'
                    });

                    getUserAndPhoto([result.data]);

                    // 待优化
                    // 这里可以判断是否已经有了当前用户的信息
                    renderUser(me.$main, data.objList);

                    me.page.virtualInput.reset();

                    me.$listNull.addClass('hide');
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
        jids.push(item.userId);
    });

    users.getUserAndPhoto(jids)
        .done(function (data) {
            if (data && data.length > 0) {
                render(data);
            }
        })
        .fail(function () {});
}

/**
 * 后渲染 人员信息
 *
 * @param {Array} arr, 后端数据 评论数组
 */
function render(data) {

    data.forEach(function (item) {

        var $item = $('.user-' + users.takeJid(item.jid));

        if ($item.length) {
            $item.find('.user-photo').html('<img src="data:image/png;base64,' + item.base64 + '" />');
            $item.find('.user-name').html(item.name);
        }
    });
}

module.exports = fn;
