/**
 * @file detail.js
 * @author deo
 *
 * 任务详情页
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

// 事件&讨论的分页请求 每页条数
var requestPageNum = 10;

// 附件默认展示的最大数量
var defaultAttachNum = 5;

var taskId = util.params('taskId');

// 正常条件下不可能为空，只有在错误情况下为空，默认会给 0
var role = util.params('role') || 0;

page.enter = function () {
    var me = this;

    me.$main = $('.main');

    me.data.describeTitleRaw = me.lang.taskTitle;
    me.data.summaryTitleRaw = me.lang.taskSummaryTitle;

    me.data.rights.taskId = me.data.id;

    me.render('#detail-main', me.data, {
        partials: {
            title: tmplTitle,
            describe: tmplDescribe
        }
    });

    if (me.data && me.data.rights) {
        me.render('#fixbar', me.data);
    }

    detailUtil.richContent();

    me.initAffairAndTalkList();

    // 如果返回刷新，不再绑定事件
    if (!me.isRefresh) {
        me.bindEvents();
    }

    // 根据权限渲染之后修正样式
    detailUtil.fixStyles();

};

/**
 * 等待 设备
 */
page.deviceready = function () {
    var me = this;
    var data = me.data;

    var titleMap = {
        affair: me.lang.affairDetail,
        talk: me.lang.talkDetail
    };

    // 跳转到事件或讨论页面
    me.$main.off('click')
        .on('click', '.affair-talk-item', function () {
            // affair or talk
            var pageTo = $(this).data('page');
            var type = $(this).data('type');

            if (pageTo && pageTo.length > 0) {
                navigation.open(pageTo, {
                    title: titleMap[type],
                    returnParams: function (prevData) {
                        if (prevData && prevData === 'refresh:event-talk-list') {
                            me.initAffairAndTalkList();
                        }
                    }
                });
            }
        })
        // 查看更多人员
        .on('click', '.partner-more', function () {
            var jids = $(this).data('jids');

            if (jids && jids.toString().length > 0) {
                navigation.open('/users-list.html?jids=' + jids, {
                    title: me.lang.usersView
                });
            }
        });

    // 底部 按钮的语言包对应关系
    var barMap = {
        affair: me.lang.newAffair,
        talk: me.lang.startTalk,
        summary: me.lang.taskDone,
        talkSummary: me.lang.summary,
        notAgree: me.lang.notAgree,
        agree: me.lang.agree,
        refuse: me.lang.refuse
    };

    // 页面底部跳转
    $('body').on('click', '#fixbar li', function () {
        var target = this;
        var $click = $(target);
        var pageTo = $click.data('page');
        var type = $click.data('type');

        // 跳转到新页面的
        if (pageTo && pageTo.length > 0) {
            navigation.open(pageTo, {
                title: barMap[type],
                transitionParam: {
                    transFlag: 1,
                    isClosePage: 0,
                    shareFlag: 0
                },
                returnParams: function (prevData) {
                    if (prevData && prevData === 'refresh') {
                        me.refresh();
                    }
                }
            });
        }

        // 这里是异步操作由 asyncTaskWork 来做异步事务同时刷新当前页面
        else {
            // 弹出框
            // 实际这里是接收 ^.^
            MidUI.alert({
                content: me.lang.alertReceivedContent,
                onApply: function () {
                    var actions = {
                        actionTag: 'taskReceived',
                        targetTag: {
                            taskId: taskId
                        }
                    };

                    asyncTaskWork(target, type, actions);
                }
            });
        }
    });

    me.setNavigation();

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

    // 加载附件数据
    me.ajaxAttach();

    // 设置总结附件
    var summaryAttachsLength = 0;
    var summaryAttachsData = [];
    if (data.summaryAttachs && data.summaryAttachs.length) {
        summaryAttachsLength = data.summaryAttachs.length;
        summaryAttachsData = summaryAttachsLength > 5 ? data.summaryAttachs.slice(0, 5) : data.summaryAttachs;
        me.initAttach(summaryAttachsData, 'summaryAttachs');
        if (summaryAttachsLength > 5) {
            $('.summary-attach .load-more').removeClass('hide');
        }
    }
};

/**
 * 设置框外按钮
 */
page.setNavigation = function () {
    var me = this;

    navigation.left({
        click: function () {
            navigation.open(-1, {
                goBackParams: 'refresh'
            });
        }
    });

    detailUtil.naviRight(me, me.data, 'task', function () {
        // 弹出框
        MidUI.alert({
            content: me.lang.alertRecoveryContent,
            onApply: function () {
                var actions = {
                    actionTag: 'taskRecover',
                    targetTag: {
                        taskId: taskId
                    }
                };
                asyncTaskWork(null, 'revoke', actions);
            }
        });
    });
};

/**
 * 异步处理任务相关事务
 *
 * @param {Element} target, 点击项
 * @param {string} ajaxKey, 对应 receive, revoke
 * @param {Object} actionObj, 埋点数据
 */
function asyncTaskWork(target, ajaxKey, actionObj) {

    // 默认配置
    var defMap = {
        params: {
            taskId: page.data.id
        },
        done: function () {
            page.refresh();
            $('.main').removeClass('nofixbar');
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

            // 这些按钮点击之后 当前任务刷新后不会再具备该功能
            target && $(target).off('click');
        })
        .always(function (result) {
            if (!actionObj) {
                return;
            }
            var errCode = (result && result.meta && result.meta.code !== 200) ? result.meta.code : '';
            page.sendLog(actionObj, errCode);
        });
}

page.bindEvents = function () {
    var me = this;

    me.$more = $('#affair-talk-more-handler');
    me.$affairTalk = $('#affair-talk');
    me.$fixbar = $('.fixbar');
    var $star = $('.star');

    $star.off('click');
    $star.on('click', function () {
        me.follow(this);
    });

    // bind 附件加载更多
    $('.attach, .summary-attach').off('click');
    $('.attach, .summary-attach').on('click', '.load-more', function () {
        var type = $(this).attr('data-type');
        var url = '/attach-attach.html?taskId=' + taskId + '&page=task&type=' + type + '&total=' + me.attachData.total;
        navigation.open(url, {
            title: me.lang.attach
        });
    });
};

/**
 * 初始化事件&讨论列表
 */
page.initAffairAndTalkList = function () {
    var me = this;

    // 先清空
    $('#affair-talk dd').remove();

    if (me.dataLoader) {
        me.dataLoader = null;
    }

    // 初始化一个点击加载组件
    me.dataLoader = new DataLoader({
        wrapper: '.affair-talk-wrapper',
        promise: function () {
            return page.get(config.API.AFFAIR_TALK_MORE_URL, {
                taskId: page.data.id,
                currPage: this.page,
                // 事件&讨论列表 讨论参与人权限问题，需要该字段
                role: role || 0,
                number: requestPageNum,
                sortType: 0
            });
        },
        // 后端数据节点位置
        dataKey: 'objList',
        loadType: 0,
        pageNum: requestPageNum
    });

    me.dataLoader.off('more');

    // 加载 事件&讨论 列表
    me.dataLoader.on('more', function (event, err, data) {

        if (err) {
            return;
        }

        // 事件 & 讨论 详情需要 任务的状态
        // taskStatus
        data.taskStatus = page.data.status;

        // 已撤销 由该字段控制
        if (page.data.suspend) {
            data.taskStatus = 7;
        }

        detailUtil.formatEventTalkData(data, this.page);

        page.render('#affair-talk', data, {type: 'append'});
    });
};

var attachDom = {
    attachs: {
        container: '.attach-container',
        wrapper: '.attach'
    },
    summaryAttachs: {
        container: '.summary-attach-container',
        wrapper: '.summary-attach'
    }
};

/**
 * 初始化附件
 *
 * @param {Object} attachData, 附件数据
 * @param {string} type, 附件类型
 */
page.initAttach = function (attachData, type) {
    var dom = attachDom[type];
    AttachWrapper.initDetailAttach({
        attachData: attachData,
        container: dom.container,
        wrapper: dom.wrapper
    });
};

/**
 * 加载附件
 *
 */
page.loadAttach = function () {
    var me = this;
    if (!me.attachData) {
        return;
    }
    var attachList = me.attachData.objList;
    var total = me.attachData.total;

    if (!attachList || !attachList.length) {
        return;
    }
    me.initAttach(attachList, 'attachs');
    if (total > defaultAttachNum) {
        $('.attach .load-more').removeClass('hide');
    }
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
        0: {
            done: 'removeClass',
            fail: 'addClass'
        },
        1: {
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
        })
        .always(function (result) {
            var errCode = (result && result.meta && result.meta.code !== 200) ? result.meta.code : '';
            var type = status === 1 ? 'follow' : 'cancel';
            var data = {
                actionTag: 'taskDetailFollow',
                targetTag: {
                    taskId: me.data.id,
                    type: type
                }
            };
            me.sendLog(data, errCode);
        });
};

/**
 * log 记录
 *
 * @param {Object} obj, 埋点数据
 * @param {number|null} error, 错误码，可为空
 */
page.sendLog = function (obj, error) {
    if (!obj) {
        return;
    }
    if (error && obj.targetTag) {
        obj.targetTag.error = error;
    }

    this.log.store(obj);
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
                obj[item] && data.push(obj[item]);
            });
        }
        else {
            data = obj[ids];
        }

        return data;
    };

    // typeKey: creator, principal, partner
    for (var typeKey in srcObject) {
        if (srcObject.hasOwnProperty(typeKey)) {

            var ids = srcObject[typeKey];

            finder[typeKey] = getData(ids, typeKey);
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
 * 请求附件列表
 *
 */
page.ajaxAttach = function () {
    var me = this;
    var promise = page.get(config.API.ATTACH_LIST, {
        taskId: taskId,
        currPage: 1,
        number: defaultAttachNum
    });

    promise
        .done(function (result) {
            if (result.meta && result.meta.code === 200) {
                if (!me.attachData) {
                    me.attachData = result.data;
                }
            }
        })
        .fail(function (err) {
            // console.log(err);
        })
        .always(function () {
            me.loadAttach();
        });
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
        taskId: taskId
    });

    promise
        .done(function (result) {
            if (result.meta && result.meta.code !== 200) {
                dfd.reject(result);
            }
            else {
                result.data.isTaskPage = true;
                result.data.pageType = 'task';
                me.data = detailUtil.dealPageData(result.data);
                dfd.resolve(me.data);
            }
        })
        .fail(function (err) {
            // console.log(err);
        });

    return dfd;
});

page.start();
