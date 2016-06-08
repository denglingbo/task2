/**
 * @file detail.js
 * @author deo
 *
 * 详情页公共包
 * 处理 任务详情页，事件详情页，讨论详情页
 *
 */
var users = require('common/middleware/users/users');
var util = require('common/util');
var lang = require('common/lang').getData();
var raw = require('common/widgets/raw');
var IScroll = require('dep/iscroll');

var detail = {};

/**
 * 初始化 Page 基本数据
 *
 * @param {Object} result, 处理详情页初始数据
 * @return {Object}
 */
detail.dealPageData = function (result) {
    if (result.meta && result.meta.code !== 200) {
        return null;
    }

    var data = result.data;

    if (data.content) {
        data.content = util.decodeHTML(data.content);
    }

    data.isDone = function () {
        return this.status === 6;
    };

    // 时间展示
    data.updateDateRaw = function () {
        return raw.formatDateToNow(this.opTime);
    };

    data.statusRaw = function () {
        var status = this.status;

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
    if (users.uid() === data.principalUser) {
        data.isMaster = 1;
    }

    data.creator = '';
    data.principal = data.principalUser;
    data.partnerRaw = data.attendIds;

    return data;
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

    me.ticker.on('tick', function (isCurTicked) {
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
                if (result && result.meta && result.meta.code === 200) {
                    myTicker[type.done]();
                    changeStatus(type.done);
                }
                else {
                    myTicker[type.fail]();
                    changeStatus(type.fail);
                }
            })
            .fail(function () {
                myTicker[type.fail]();
                changeStatus(type.fail);
            });
    });
};

/**
 * 富文本区域支持滑动
 */
detail.richContent = function () {

    var $outer = $('.rich-outter');
    var $inner = $('.rich-inner');

    var max = {
        width: $outer.width(),
        height: 250
    };
    var real = {};

    $outer.css({
        width: 9999,
        position: 'relative'
    });

    $inner.addClass('absolute');
    real.width = $inner.width();
    real.height = $inner.height();
    $inner.removeClass('absolute');

    $outer.css({
        width: max.width
    });

    var scrollX = false;
    var scrollY = false;

    if (real.width - max.width > 10) {
        scrollX = true;
        $outer.width(max.width);
    }
    if (real.height > max.height) {
        scrollY = true;
        $outer.height(max.height);
    }

    if (!scrollX && !scrollY) {
        return;
    }

    $inner.css({
        width: real.width,
        height: real.height
    });

    // 初始化 scroll
    new IScroll($outer[0], {
        scrollX: scrollX,
        scrollY: scrollY,
        scrollbars: false,
        // click: true,

        // 禁用监听鼠标和指针
        disableMouse: false,
        disablePointer: false,

        mouseWheel: false,

        // 快速触屏的势能缓冲开关
        momentum: false
    });
};

module.exports = detail;
