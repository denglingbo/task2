/**
 * @file detail.js
 * @author deo
 * 任务详情页
 *
 */

require('./detail.scss');

var config = require('../config');
var detailUtil = require('common/widgets/detail/detail');
var users = require('common/middleware/user/users');
var ScrollMore = require('common/ui/scrollMore/scrollMore');
var util = require('common/util');
var Page = require('common/page');
var AttachWrapper = require('common/middleware/attach/attachWrapper');

// 页码提示
/*
require('common/ui/pagination/pagination.scss');
var Pagination = require('common/ui/pagination/pagination');
*/

require('common/widgets/emptyPage/netErr.scss');
var tmplError = require('common/widgets/emptyPage/netErr');
var tmplTitle = require('common/widgets/detail/title');
var tmplDescribe = require('common/widgets/detail/describe');

var page = new Page({
    pageName: 'task-detail'
});

var requestPageNum = 10;

page.error = function () {
    this.render('#detail-main', this.data, {
        tmpl: tmplError
    });
};

page.enter = function () {
    var me = this;

    me.$main = $('.main');

    me.data.isTaskPage = true;
    me.data.describeTitle = this.lang.taskTitle;
    /* eslint-disable */
    me.data.rights['task_id'] = me.data.id;
    /* eslint-enable */

    me.render('#detail-main', me.data, {
        partials: {
            title: tmplTitle,
            describe: tmplDescribe
        }
    });

    // 初始化一个点击加载组件
    me.scrollMore = new ScrollMore({
        wrapper: '.affair-talk-wrapper',
        promise: function () {
            /* eslint-disable */
            return page.get(config.API.AFFAIR_TALK_MORE_URL, {
                task_id: me.data.id,
                curr_page: this.page,
                number: requestPageNum,
                sort_type: 0
            });
            /* eslint-enable */
        },
        // 后端数据节点位置
        listKey: 'obj_list',
        pageNum: requestPageNum
    });

    me.bindEvents();

    /* eslint-disable */
    me.attach = AttachWrapper.initDetailAttach({
        attachData: me.data.summary_attachs,
        container: '.attach-container',
        wrapper: '.attach'
    });
    /* eslint-enable */
};

page.bindEvents = function () {
    var me = this;

    me.$more = $('#affair-talk-more-handler');
    me.$affairTalk = $('#affair-talk');
    me.$fixbar = $('.fixbar');

    $('.star').on('click', function () {
        me.follow(this);
    });

    // 查看更多人员
    me.$main.on('click', '.partner-more', function () {
        var jids = $(this).data('jids');

        if (jids && jids.toString().length > 0) {
            /* eslint-disable */
            CPNavigationBar.redirect('/users/list.html?jids=' + jids);
            /* eslint-enable */
        }
    });

    // 跳转到事件或讨论页面
    me.$main.on('click', '.affair-talk-item', function () {
        // affair or talk
        var pageTo = $(this).data('page');

        if (pageTo && pageTo.length > 0) {
            /* eslint-disable */
            CPNavigationBar.redirect(pageTo);
            /* eslint-enable */
        }
    });

    // 页面底部跳转
    me.$fixbar.find('li').on('click', function () {
        var pageTo = $(this).data('page');

        if (pageTo && pageTo.length > 0) {
            /* eslint-disable */
            CPNavigationBar.redirect(pageTo);
            /* eslint-enable */
        }
    });


    // 第一次的时候把 page 相关的参数配置好
    // me.scrollMore.on('complete', function (data) {
    //     me.pagination = new Pagination({
    //         elems: '#affair-talk dd',
    //         // data-pagenum，数据来源
    //         finder: 'pagenum',
    //         pageNum: requestPageNum,
    //         // 可视偏移量
    //         offset: -44,
    //         total: data.total,
    //         // 在屏幕下方作为展示的基准点
    //         screen: 1
    //     });
    // });

    me.scrollMore.on(['complete', 'loadmore'], function (data) {
        var loader = this;

        // Mustache.js 的逗比之处
        // {{#list}}
        //  中无法获取到 list 同级的数据，类似当前这个 data.pagenum, ...
        // {{/list}}
        data.pagenum = function () {
            // return data.page;
            return loader.page;
        };
        // data.typeRaw =
        // console.log(data)

        data.list = detailUtil.getEventTalkList(data.obj_list);

        me.render('#affair-talk', data, {type: 'append'});

        // 分页要放在render 之后
        // me.pagination.complete();
    });
};

/**
 * 添加或取消关注
 *
 * @param {Element} target, 点击的元素
 */
page.follow = function (target) {
    var me = this;
    var $elem = $(target);
    var status = 0;

    /* eslint-disable */
    var map = {
        '0': {
            done: 'removeClass',
            fail: 'addClass'
        },
        '1': {
            done: 'addClass',
            fail: 'removeClass'
        }
    };
    /* eslint-enable */

    // 取消关注
    if ($elem.hasClass('follow')) {
        status = 0;
    }
    // 关注
    else {
        status = 1;
    }

    var type = map[status];

    /* eslint-disable */
    var promise = page.post(config.API.TASK_FOLLOW + '?task_id=' + me.data.id + '&level=' + status);
    /* eslint-enable */

    promise
        .done(function (result) {
            if (result && result.meta.code === 200) {
                $elem[type.done]('follow');
            }
            else {
                $elem[type.fail]('follow');
            }
        })
        .fail(function () {
            $elem[type.fail]('follow');
        });
};

page.arr2Object = function (arr, key) {
    var obj = {};

    for (var i = 0; i < arr.length; i++) {
        var item = arr[i];

        if (item[key]) {
            var itemId = users.takeJid(item[key]);
            var id = parseInt(itemId, 10);
            obj[id] = item;
        }
    }

    return obj;
};

/**
 * 查找某子对象是否属于源数据对象，同时把对应的数据附加到 appendObject 上
 *
 * @param {Object} srcObject, 源数据对象
 * @param {Object} arr, 数组
 * @return {Object}
 *
 */
page.findOwner = function (srcObject, arr) {
    var finder = {};
    var obj = this.arr2Object(arr, 'jid');

    var getData = function (ids, key) {
        var data;

        if ($.isArray(ids)) {
            data = [];

            ids.forEach(function (item) {
                data.push(obj[item]);
            });
        }
        else {
            data = obj[ids];
        }

        return data;
    };

    for (var key in srcObject) {
        if (srcObject.hasOwnProperty(key)) {

            var ids = srcObject[key];

            finder[key] = getData(ids, key);
        }
    }

    return finder;
};

/**
 * 成员获取失败
 *
 */
page.failUser = function () {
    $('#partner').html('<div class="sub-title">数据加载失败, 刷新重试</div>');
};

/**
 * 渲染成员数据
 *
 * @param {Array} originArr, 原始数组数据 jids，未merge 过的数组
 * @param {Array} dataArr, 匹配到的数据
 *
 */
page.renderUser = function (originArr, dataArr) {
    var me = this;

    var data = me.findOwner(originArr, dataArr);

    var dataRaw = {};

    // 创建人数据
    if (data.creator) {
        dataRaw.creator = data.creator.name;
    }

    // 负责人数据
    if (data.principal) {
        dataRaw.principal = data.principal.name;
    }

    // 成员数据
    if (data.partner) {
        var partnerRaw = [];
        var partnerJids = [];

        data.partner.forEach(function (item) {
            partnerRaw.push(item.name);
            partnerJids.push(users.takeJid(item.jid));
        });

        if (partnerRaw.length) {
            dataRaw.partnerLength = partnerRaw.length;
        }

        dataRaw.partnerRaw = partnerRaw.join('、');
        dataRaw.partnerJids = partnerJids.join(',');
    }

    dataRaw.lang = this.lang;

    this.render('#partner', dataRaw);
};

/**
 * 请求页面接口
 *
 * @param {deferred} dfd, deferred
 *
 */
page.addParallelTask(function (dfd) {
    var me = this;

    /* eslint-disable */
    var promise = page.get(config.API.TASK_DETAIL_URL, {
        task_id: util.params('task_id')
    });
    /* eslint-enable */
    promise
        .done(function (result) {
            var data = detailUtil.dealPageData(result);

            if (data === null) {
                dfd.reject(data);
            }
            else {

                // 下面为获取人员信息的配置
                var obj = {
                    creator: data.create_user,
                    principal: data.principal_user,
                    partner: data.attend_ids
                };

                var jids = users.makeArray(obj);

                var dfdPub = users.getUserInfo(jids, data.cid);

                // 查询用户信息失败
                if (dfdPub === null) {
                    me.data.userInfoFail = true;
                }
                else {
                    dfdPub
                        .done(function (pubData) {
                            me.renderUser(obj, pubData.contacts);
                        })
                        .fail(function () {
                            me.failUser();
                        });
                }

                me.data = data;
                dfd.resolve(data);
            }

        })
        .fail(function (err) {
            // console.log(err);
        });

    return dfd;
});

$(function () {
    page.start();
});
