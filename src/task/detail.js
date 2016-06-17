/**
 * @file detail.js
 * @author deo
 * 任务详情页
 *
 */

require('./detail.scss');

var config = require('../config');
var Page = require('common/page');
var page = new Page();

var detailUtil = require('common/widgets/detail/detail');
var users = require('common/middleware/users/users');
var DataLoader = require('common/ui/dataLoader/dataLoader');
var util = require('common/util');
var AttachWrapper = require('common/middleware/attach/attachWrapper');
var navigation = require('common/middleware/navigation');
var MidUI = require('common/middleware/ui');

require('common/widgets/emptyPage/netErr.scss');
var tmplTitle = require('common/widgets/detail/title');
var tmplDescribe = require('common/widgets/detail/describe');

var requestPageNum = 10;

page.enter = function () {
    var me = this;

    me.$main = $('.main');

    me.data.isTaskPage = true;

    me.data.describeTitleRaw = me.lang.taskTitle;
    me.data.summaryTitleRaw = me.lang.taskSummaryTitle;

    me.data.rights.taskId = me.data.id;
    me.render('#detail-main', me.data, {
        partials: {
            title: tmplTitle,
            describe: tmplDescribe
        }
    });

    detailUtil.richContent();

    // 初始化一个点击加载组件
    me.dataLoader = new DataLoader({
        wrapper: '.affair-talk-wrapper',
        promise: function () {
            return page.get(config.API.AFFAIR_TALK_MORE_URL, {
                taskId: me.data.id,
                currPage: this.page,
                number: requestPageNum,
                sortType: 0
            });
        },
        // 后端数据节点位置
        dataKey: 'objList',
        loadType: 0,
        pageNum: requestPageNum
    });

    me.bindEvents();

    // 根据权限渲染之后修正样式
    detailUtil.fixStyles();
};

/**
 * 等待 设备
 */
page.deviceready = function () {
    var me = this;
    var lang = me.lang;
    var data = me.data;

    // 查看更多人员
    me.$main.on('click', '.partner-more', function () {
        var jids = $(this).data('jids');

        if (jids && jids.toString().length > 0) {
            navigation.open('/users-list.html?jids=' + jids, {
                title: me.lang.usersView
            });
        }
    });

    var titleMap = {
        affair: me.lang.affairDetail,
        talk: me.lang.talkDetail
    };

    // 跳转到事件或讨论页面
    me.$main.on('click', '.affair-talk-item', function () {
        // affair or talk
        var pageTo = $(this).data('page');
        var type = $(this).data('type');

        if (pageTo && pageTo.length > 0) {
            navigation.open(pageTo, {
                title: titleMap[type]
            });
        }
    });

    var barMap = {
        affair: me.lang.newAffair,
        talk: me.lang.startTalk,
        summary: me.lang.summary,
        notAgree: me.lang.notAgree,
        agree: me.lang.agree
    };

    // 页面底部跳转
    me.$fixbar.find('li').on('click', function () {
        var $click = $(this);
        var pageTo = $click.data('page');
        var type = $click.data('type');

        if (pageTo && pageTo.length > 0) {
            navigation.open(pageTo, {
                title: barMap[type]
            });
        }
        else {
            asyncTaskWork(this, type);
        }
    });

    // 这里需要根据 referer 判断是否返回指定页面
    navigation.left({
        title: lang.back,
        click: function () {
            navigation.open(-1, {
                title: me.lang.dispatch
            });
        }
    });

    detailUtil.naviRight(me, me.data, 'task', function () {

        // 弹出框
        MidUI.alert({
            content: me.lang.alertRevokeContent,
            onApply: function () {
                asyncTaskWork(null, 'revoke');
            }
        });
    });

    // 下面为获取人员信息的配置
    var obj = {
        creator: data.createUser
    };
    if (data.principalUser) {
        obj.principal = data.principalUser;
    }
    if (data.attendIds.length) {
        obj.partner = data.attendIds;
    }

    var jids = users.makeArray(obj);
    var dfdPub = users.getUserInfo(jids, data.cid);

    dfdPub
        .done(function (pubData) {
            if (pubData && pubData.contacts) {
                me.renderUser(obj, pubData.contacts);
            }
            else {
                me.failUser();
            }
        })
        .fail(function () {
            me.failUser();
        });

    if (data.attachements) {
        me.attach = AttachWrapper.initDetailAttach({
            attachData: data.attachements,
            container: '.attach-container',
            wrapper: '.attach'
        });
    }
};

/**
 * 异步处理任务相关事务
 *
 * @param {Element} target, 点击项
 * @param {string} ajaxKey, 对应 receive, revoke
 */
function asyncTaskWork(target, ajaxKey) {

    // 默认配置
    var defMap = {
        params: {
            taskId: page.data.id
        },
        done: function () {
            navigation.open('/task-detail.html?taskId=' + page.data.id);
        }
    };

    var workMap = {
        // 接收
        receive: {
            api: config.API.TASK_RECEIVE
        },

        // 恢复
        revoke: {
            api: config.API.TASK_RECOVER
        }
    };

    var taskWorker = workMap[ajaxKey];
    if (!taskWorker) {
        return;
    }

    $.extend(taskWorker, defMap);

    page.post(taskWorker.api, taskWorker.params)
        .done(function (data) {
            taskWorker.done();
        });

    target && $(target).off('click');
}

page.bindEvents = function () {
    var me = this;

    me.$more = $('#affair-talk-more-handler');
    me.$affairTalk = $('#affair-talk');
    me.$fixbar = $('.fixbar');

    $('.star').on('click', function () {
        me.follow(this);
    });

    // 加载 事件&讨论 列表
    me.dataLoader.on('more', function (err, data) {

        if (err) {
            return;
        }

        // 事件 & 讨论 详情需要 任务的状态
        // taskStatus
        data.taskStatus = me.data.status;
        detailUtil.formatEventTalkData(data, this.page);

        me.render('#affair-talk', data, {type: 'append'});
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

    var map = {
        0: {
            done: 'removeClass',
            fail: 'addClass'
        },
        1: {
            done: 'addClass',
            fail: 'removeClass'
        }
    };

    // 取消关注
    if ($elem.hasClass('follow')) {
        status = 0;
    }
    // 关注
    else {
        status = 1;
    }

    var type = map[status];

    var promise = page.post(config.API.TASK_FOLLOW, {
        taskId: me.data.id,
        level: status
    });


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

/**
 * 数组使用某字段改为对象
 *
 * @param {Array} arr, 数组
 * @param {string} key, 某键
 * @return {Object}
 *
 */
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
    $('#partner').html('<div class="sub-title">' + this.lang.dataLoadFailPleaseReLoad + '</div>');
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
    if (data.creator && data.creator.name) {
        dataRaw.creator = data.creator.name;
    }

    // 负责人数据
    if (data.principal && data.principal.name) {
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

    var promise = page.get(config.API.TASK_DETAIL_URL, {
        taskId: util.params('taskId')
    });

    promise
        .done(function (result) {
            if (result.meta && result.meta.code !== 200) {
                dfd.reject(result);
            }
            else {
                me.data = detailUtil.dealPageData(result.data);
                dfd.resolve(me.data);
            }
        })
        .fail(function (err) {
            // console.log(err);
        });

    return dfd;
});

$(window).on('load', function () {
    page.start();
});
