/* eslint-disable */
var tmplItem = require('./item.tpl');
var Pharos = require('common/ui/pharos');
var users = require('common/middleware/users/users');
var util = require('common/util');
var raw = require('common/widgets/raw');
var AttachWrapper = require('common/middleware/attach/attachWrapper');
var DataLoader = require('common/ui/dataLoader/dataLoader');
var MidUI = require('common/middleware/ui');
var editCom = require('common/widgets/edit/editCommon');

function dealData(data, page) {

    // page.isDone 不能直接使用，该值为进入页面赋值，并未更改
    data.isDone = function () {
        return page.data.status === 6;
    };

    // 时间展示
    data.dataRaw = function () {
        return raw.formatDateToNow(this.opTime);
    };

    // 只有［任务］在进行中，才可以对事件 & 讨论进行操作
    var taskStatus = util.params('taskStatus');

    // 判断任务是否在进行中
    data.taskDoing = function () {
        if (!taskStatus) {
            return true;
        }

        return parseInt(taskStatus, 10) === 4;
    };

    // 判断是否是评论所有者
    data.deleteRights = function () {
        var uid = users.uid();

        if (this.userId && uid && data.taskDoing()) {
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
var list = function (page, options) {
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
        moreNullHidden: me.opts.moreNullHidden || false,
        promise: me.opts.promise,
        // 后端数据节点位置
        dataKey: me.opts.dataKey,
        pageNum: 10
    });

    me.dataLoader.on('more', function (event, err, data) {

        if (err) {
            return;
        }

        // 评论需要知道是否是已经完成的 讨论 或者 事件
        data.isDone = me.page.data.isDone();

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

$.extend(list.prototype, {

    isComments: function () {
        return this.$main.find('dd').not('.list-null').length;
    },

    bindEvents: function () {
        var me = this;
        var $main = $('#comments-main');

        $main.off('click').on('click', '.delete', function () {
            var target = this;

            MidUI.alert({
                content: me.page.lang.alertRemoveComment,
                onApply: function () {
                    me.removeData(target);
                }
            });
        });

        $('.send').off('click').on('click', function () {
            me.addComment();
        });
        me.attach = editCom.initEditAttach();
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
        var attachs = me.attach.getModifyAttaches();
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
            attachements: attachs
        });
        var success = false;
        promise
            .done(function (result) {

                if (!result || result.meta.code !== 200) {
                    return;
                }
                // 添加成功
                if (result.meta.code === 200) {
                    success = true;
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
                    $('#attachList ul').html('');
                    me.$listNull.addClass('hide');
                }
                else {

                }
            })
            .fail(function (err) {
                
            })
            .always(function () {
                if (success) {
                    $('#goalui-fixedinput').removeClass('extend');
                    $('#goalui-fixedinput-shadow').addClass('hide');
                }
            })
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

module.exports = list;
