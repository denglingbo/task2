/**
 * @file detail.js
 * @author deo
 *
 * 详情页公共包
 * 处理 任务详情页，事件详情页，讨论详情页
 *
 */
var util = require('common/util');
var lang = require('common/lang').getData();
var raw = require('common/widgets/raw');
var navigation = require('common/middleware/navigation');

var detail = {};

/**
 * 处理后端的表单富文本
 *
 * @param {string} str, 字符串
 * @return {string} 处理后的表单富文本
 */
var richForm = function (str) {

    return str
        .replace(/<table/g, '<div class="richtext-wrap"><table')
        .replace(/<\/table>/g, '</table></div>')
        .replace(/<colgroup>[\s\S]*<\/colgroup>/, '')
        .replace()
        .replace(
            /<p><img[\s\S]*(src="[\s\S]*?")[\s\S]*?(\/)?><\/p>/g,
            '<div class="richtext-img"><img width="100%" style="margin: 5px 0px" $1 /></div>'
        );
};

/**
 * 初始化 Page 基本数据
 *
 * @param {Object} data, 处理详情页初始数据
 * @return {Object}
 */
detail.dealPageData = function (data) {
    if (!data) {
        return null;
    }

    // 描述
    if (data.content) {
        data.content = util.decodeHTML(data.content);

        // 处理表单
        data.content = richForm(data.content);
    }

    data.isDone = function () {
        return this.status === 6;
    };

    data.isRefuse = function () {
        return this.status === 3;
    };

    // 只有［任务］在进行中，才可以对事件 & 讨论进行操作
    // 判断任务是否在进行中
    // 用于 事件 & 讨论 页面从 url 参数中 获取 task 是否完成
    // 此处是 task page 跳转 url 上的，所以不需要判断 data.suspend
    var taskStatus = util.params('taskStatus');
    data.taskDoing = function () {

        if (!taskStatus) {
            return true;
        }

        return parseInt(taskStatus, 10) === 4;
    };

    // 外层条件: !isTaskPage, 所以这里不需要再判断是不是 事件 or 讨论
    // 事件 or 讨论
    data.resumeOrCloseRights = function () {
        if (!this.rights) {
            return false;
        }

        if (this.pageType === 'talk') {
            return this.rights.resumeRight || this.rights.closeRight;
        }

        else if (this.pageType === 'affair') {
            return this.rights.doneRight || this.rights.recoverRight;
        }

        return false;
    };

    // 时间展示
    data.updateDateRaw = function () {
        return raw.formatDateToNow(this.opTime);
    };

    data.statusRaw = function () {
        var status = this.status;

        // 已撤销
        if (this.suspend) {
            status = 7;
        }

        return raw.status(status, this.endTime);
    };

    data.importanceRaw = function () {
        return raw.importance(this.importanceLevel);
    };

    data.doneTimeRaw = function () {
        return raw.dateToDone(this.endTime);
    };

    data.isMaster = 0;

    // 负责人到完成任务页面有备注信息填写
    // 判断这个用户点击完成任务过去的页面的展示权限
    if (data.createUser === data.principalUser) {
        data.isMaster = 1;
    }

    data.creator = '';
    data.principal = data.principalUser;
    data.partnerRaw = data.attendIds;

    return data;
};

detail.fixStyles = function () {
    var $main = $('.main');
    var $fixbar = $('.fixbar');

    if ($fixbar.find('li').length === 0 && $('#goalui-fixedinput').length === 0) {
        $main.addClass('nofixbar');
    }
};

/**
 * format 事件 讨论 列表的数据格式
 *
 * @param {Object} data, 数据
 * @param {number} pagenum, 当前页数
 */
detail.formatEventTalkData = function (data, pagenum) {

    var temp = [];
    var list = data.objList || [];

    // Mustache.js 的逗比之处
    // {{#list}}
    //  中无法获取到 list 同级的数据，类似当前这个 data.pagenum, ...
    // {{/list}}
    data.pagenum = function () {
        return pagenum;
    };
    data.isDone = function () {
        return this.status === 6;
    };

    list.forEach(function (item) {
        if (item.type === 2) {
            item.typeRaw = lang.talk;

            // 用于跳转到的页面类型
            item.pageType = 'talk';
        }
        if (item.type === 3) {
            item.typeRaw = lang.affair;
            item.pageType = 'affair';
        }

        temp.push(item);
    });

    data.objList = temp;
};

/**
 * 绑定 tick 相关事件，调用：
 * [module].bindTickEvents.call(this, {
 *    ticked: config.API.TALK_DONE,
 *    untick: config.API.TALK_RESUME
 * });
 * this -> 指向 page
 *
 * @param {Object} options, api config
 */
detail.bindTickEvents = function (options) {

    var me = this;
    /* eslint-disable */
    // 完成按钮点击事件
    var map = {
        0: {
            done: 'untick',
            fail: 'ticked'
        },
        1: {
            done: 'ticked',
            fail: 'untick'
        }
    };
    /* eslint-enable */
    // 要改变的状态容器
    var $status = $('.detail-title-state');

    /**
     * 改变状态
     *
     * @param {string} status, 点击完成后的勾选状态，ticked or untick
     */
    function changeStatus(status) {
        var statusText = $status.data('status');
        var $delete = $('.comments-button');

        if (status === 'ticked') {
            $status.html(me.lang.doneText);
            $delete.addClass('hide');

            // 更改完成状态
            me.isDone = true;
        }
        else {

            // 已经是完成状态的，取消的时候直接改为 进行中
            if (statusText === me.lang.doneText) {
                statusText = me.lang.doingText;
            }

            me.isDone = false;
            $status.html(statusText);
            $delete.removeClass('hide');
        }
    }

    function failed(myTicker, type) {
        myTicker[type.fail]();
        changeStatus(type.fail);

        var callbackFn = options[type.fail + 'Callback'];
        callbackFn && callbackFn();
    }

    /**
     * 更改状态之后 需要设置 框外右边的按钮状态
     */
    me.ticker.on('tick', function (event, isCurTicked) {
        var myTicker = this;
        // 0: 取消
        // 1: 完成
        var change = isCurTicked ? 0 : 1;
        var api = change === 1 ? options.ticked : options.untick;

        var params = {};

        params[options.pageKey] = me.data.id;

        var promise = me.post(api, params);

        var type = map[change];

        promise
            .done(function (result) {

                // 操作成功
                if (result && result.meta && result.meta.code === 200) {
                    myTicker[type.done]();
                    changeStatus(type.done);

                    var callbackFn = options[type.done + 'Callback'];

                    callbackFn && callbackFn(result.data);
                }
                else {
                    failed(myTicker, type);
                }
            })
            .fail(function () {
                failed(myTicker, type);
            });
    });
};

/**
 * 公用的 详情页 右上方按钮设置
 *
 * @param {Function} page, new Page()
 * @param {Object} data, 数据
 * @param {string} pageType, 页面类型 task, talk, affair
 * @param {Function} getAlert, 弹窗
 */
detail.naviRight = function (page, data, pageType, getAlert) {

    if (!data) {
        return;
    }

    data = this.dealPageData(data);

    // 如果任务已经结束，不再有以下操作
    if (data.taskDoing() === false) {
        return;
    }

    var pageMap = {
        talk: {
            edit: {
                url: '/talk-new.html?talkId=' + data.id,
                title: lang.editTalk
            },
            summary: {
                url: '/form-submit.html?type=talkSummary&talkId=' + data.id,
                title: lang.talkSummaryTitle
            }
        },
        affair: {
            edit: {
                url: '/affair-new.html?affairId=' + data.id,
                title: lang.editAffair
            }
        },
        task: {
            edit: {
                url: '/task-new.html?taskId=' + data.id + '&total=' + data.total,
                title: lang.editTask
            }
        }
    };

    var rightBar = [page._shell.right.more];
    var rights = data.rights;

    if (!rights) {
        return;
    }

    // 当前页面配置
    var curPage = pageMap[pageType];

    // 编辑权限
    if (rights.editRight) {
        rightBar.push({
            title: lang.editButton,
            click: function () {
                navigation.open(curPage.edit.url, {
                    title: curPage.edit.title,
                    returnParams: function (prevData) {
                        if (prevData && prevData === 'refresh') {
                            page.refresh();
                        }
                    }
                });
            }
        });
    }

    // 讨论下，总结放在右上方的按钮中
    if (pageType === 'talk' && rights.summarizeRight) {
        rightBar.push({
            title: lang.summary,
            click: function () {
                navigation.open(curPage.summary.url, {
                    title: curPage.summary.title,
                    returnParams: function (prevData) {
                        if (prevData && prevData === 'refresh') {
                            page.refresh();
                        }
                    }
                });
            }
        });
    }

    // 恢复权限
    if (rights.recoverRight && getAlert) {
        rightBar.push({
            title: lang.recover,
            click: getAlert
        });
    }

    // 撤消权限
    if (rights.revokeRight) {
        rightBar.push({
            title: lang.cancelButton,
            click: function () {
                navigation.open('/form-submit.html?type=revoke&taskId=' + data.id, {
                    title: lang.cancelTitle,
                    returnParams: function (prevData) {
                        if (prevData && prevData === 'refresh') {
                            page.refresh();
                        }
                    }
                });
            }
        });
    }

    navigation.right(rightBar);
};

/**
 * 富文本显示方式
 *
 * @param {Element} $outer, 富文本外层容器
 * @param {Element} $inner, 富文本内层容器
 */

// var richSize = function ($outer, $inner) {

//     var max = {
//         width: $outer.width(),
//         height: 250
//     };
//     var real = {};

//     $outer.css({
//         width: 9999,
//         position: 'relative'
//     });

//     $inner.addClass('absolute');
//     real.width = $inner.width();
//     real.height = $inner.height();
//     $inner.removeClass('absolute');

//     $outer.css({
//         width: max.width
//     });

//     var scrollX = false;
//     // var scrollY = false;

//     if (real.width - max.width > 10) {
//         scrollX = true;
//         $outer.width(max.width);
//     }
//     // if (real.height > max.height) {
//     //     scrollY = true;
//     //     $outer.height(max.height);
//     // }

//     if (!scrollX) {
//         return;
//     }

//     $inner.css({
//         width: real.width
//     });
// };

/**
 * 富文本
 */
detail.richContent = function () {

    // $('.rich-outter').each(function () {

    //     var $outer = $(this);
    //     var $inner = $outer.find('.rich-inner');

    //     var html = $inner.html();

    //     if (/<*.+>/.test(html)) {
    //         richSize($outer, $inner);
    //     }

    //     // $outer.after(
    //     //     '<div toggle-closed="全部" toggle-opened="收起" class="toggle-view">查看全部内容</div>'
    //     // );

    //     // $toggle = $('.toggle-view');
    // });

    // $('.main').on('click', '.toggle-view', function () {
    //     var $toggle = $(this);
    //     var opened = $toggle.attr('toggle-opened');
    //     var closed = $toggle.attr('toggle-closed');
    //     var $content = $toggle.parent().find('.rich-outter');

    //     var h = $toggle.html();

    //     // 收起
    //     if (h === opened) {
    //         $toggle.html(closed);
    //         $content.removeClass('height-auto');
    //     }
    //     // 展开
    //     else {
    //         $toggle.html(opened);
    //         $content.addClass('height-auto');
    //     }
    // });

    // 初始化 scroll
    // new IScroll($outer[0], {
    //     scrollX: scrollX,
    //     scrollY: scrollY,
    //     scrollbars: false,
    //     // click: true,

    //     // 禁用监听鼠标和指针
    //     disableMouse: false,
    //     disablePointer: false,

    //     mouseWheel: false,

    //     // 快速触屏的势能缓冲开关
    //     momentum: false
    // });
};

module.exports = detail;
