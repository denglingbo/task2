/**
 * @file initScroll.js
 * @author deo
 *
 * 初始化滚动 test [没有实现完成]
 */

var config = require('../../config');
var IScroll = require('dep/iscroll');
// var util = require('common/util');
var raw = require('common/widgets/raw');
var users = require('common/middleware/users/users');
var Pharos = require('common/ui/pharos');
var DataLoader = require('common/ui/dataLoader/dataLoader');
var util = require('common/util');
// 页码提示
require('common/ui/pagination/pagination.scss');
var Pagination = require('common/ui/pagination/pagination');

var lang = require('common/lang').getData();

require('common/widgets/emptyPage/netErr.scss');
var errTpl = require('common/widgets/emptyPage/netErr.tpl');

/**
 * role id
 * 1: 我派发的
 * 2: 我负责的
 * 3: 我参与的
 */
var rid = util.getParam('rid');

var Localdb = require('common/ui/localdb');
var coll = new Localdb(config.const.DATABASE_NAME, 'LIST');

/**
 * 批量处理数据
 *
 * @param {Object} data, data
 */
function dealData(data) {

    if (!data.lang) {
        data.lang = lang;
    }

    /* eslint-disable */
    // 时间展示
    data.updateDateRaw = function () {
        return raw.formatDateToNow(this.opTime);
    };
    data.statusRaw = function() {
        var status = this.status;

        if (this.suspend) {
            status = 7;
        }

        return raw.status(status, this.endTime);
    };
    data.delayFlag = function() {
        return raw.delay(this.status, this.endTime);
    };
    data.importanceRaw = function () {
        var str = raw.importance(this.importanceLevel);

        return str && str.length ? '[' + str + ']' : '';
    };
    data.doneTimeRaw = function () {
        return raw.dateToDone(this.endTime);
    };
    data.isRemindUpdate = function () {
        return this.remind == 2;
    };
    data.isRemindNew = function () {
        return this.remind == 1;
    };
    /* eslint-enable */
}

/**
 * 获取整个 dataList 中 负责人的 jid
 *
 * @param {Array} arr, data.obj
 * @return {Array} jids
 */
function getJids(arr) {
    var jids = [];
    for (var i = 0; i < arr.length; i++) {
        arr[i].principalUser && jids.push(arr[i].principalUser);
    }

    return jids;
}

/**
 * 初始化滚动
 *
 * @param {Object} options, options
 */
function Init(options) {

    var me = this;

    me.opts = {
        isApple: false,

        // 外容器，scroll 的外容器
        wrapper: null,

        // 实际内容容器
        // 这个 $main 将用于 dataLoader 的wrapper
        main: null,

        promise: null,
        offset: 0,
        lang: {},

        // 用于和 rid 一起进行的查询
        status: null,

        // dataLoader 需要使用
        dataKey: 'objList',

        tpl: null,

        onFirstDone: function () {},

        onPaginationDone: function () {}
    };

    $.extend(me.opts, options);

    // me.lang = {
    //     'doing': me.opts.lang.loading,
    //     'done': me.opts.lang.dataDone,
    //     'default': me.opts.lang.getMore
    // };

    me.$wrapper = $(me.opts.wrapper);
    me.$main = me.$wrapper.find(me.opts.main);

    me.scroll = null;

    // 是否加载完成
    me.load = false;

    // 是否进行刷新
    me._moring = false;

    // 重载动作
    me._reloading = false;
    // 是否进入重载范围
    me._reloadRange = false;
    // 是否允许重新加载
    me._reloadAllow = false;
    me._reloadFailed = false;

    me._deviceTimer = null;
    me._deviceTimeout = null;

    me.init();
}

Init.prototype = {

    init: function () {
        var me = this;

        // 这里的分页请求由 dataLoader 来处理
        me.dataLoader = new DataLoader({
            promise: me.opts.promise,
            dataKey: 'objList',
            wrapper: me.$main,
            errTpl: errTpl,
            lang: {
                more: {
                    'default': lang.touchLoadMore
                }
            },
            tpl: me.opts.tpl,
            reloadHandler: me.$wrapper.find('.data-reload'),
            moreHandler: me.$wrapper.find('.data-more')
        });

        me.getMoreData(function (data) {

            // 加载错误的情况下，渲染错误页面，并且创建一个错误信息
            if (!data) {
                var errData = {
                    lang: {
                        netErr: lang.failText,
                        tapPageReLoad: lang.tapPageReLoad
                    }
                };

                me.dataLoader.hideMore();
                me.dataLoader.error(errData);
                me.opts.onLoadError();

                // 点击屏幕重载
                me.opts.wrapper.one('click', function () {
                    // list-wrapper-inner
                    var $parent = $(this).parents('.list-wrapper-inner');
                    if ($parent && $parent.data('contentname')) {
                        var name = $parent.data('contentname');
                        var $tab = $('.page-loader li[data-name="' + name + '"]');

                        $tab && $tab.eq(0).triggerHandler('click');

                        var $err = me.opts.wrapper.find('.net-err');
                        if ($err.length > 0) {
                            $err.addClass('hide').remove();
                        }
                    }
                });
                return;
            }

            // 初始化滚动
            me.initScroll();

            me.opts.onFirstDone(data);

            // 初始化一个分页提示控件
            me.pagination = new Pagination({
                wrapper: me.$wrapper,
                // 每个数据容器
                elems: '.list-item',
                // data-pagenum，数据来源
                finder: 'pagenum',
                pageNum: data.number,
                // 可视偏移量
                offset: -60,
                total: data.total,
                // 在屏幕下方作为展示的基准点
                screen: 1
            });

            me.opts.onPaginationDone.call(me);
        });
    },

    /**
     * 基础设置
     */
    setBasic: function () {

        var me = this;

        var $err = me.opts.wrapper.find('.net-err');
        if ($err.length > 0) {
            $err.addClass('hide').remove();
        }

        var height = $(window).height();

        // 这里要先获取高度
        var objHeight = me.$main.height() + me.opts.offset;

        // 保证页面的最小高度
        if (objHeight < height) {
            objHeight = height;
        }

        // 很重要，这个实际用于滚动的容器需要设置可视高度
        me.$wrapper.find('.scroll-inner').css({
            height: objHeight
        });

        me.$wrapper.height(height);
    },

    initScroll: function () {
        var me = this;

        me.destroyScroll();

        setTimeout(function () {

            // 初始化 scroll
            me.scroll = new IScroll(me.$wrapper[0], {

                // 为了较为准确的加载数据，这里需要设置为 3
                probeType: 3,
                scrollX: false,
                scrollY: true,
                scrollbars: false,
                click: true,

                // 禁用监听鼠标和指针
                disableMouse: true,
                disablePointer: true,

                mouseWheel: false,

                // 快速触屏的势能缓冲开关
                momentum: me.opts.isApple
            });

            me.bindEvents();
        }, 0);
    },

    bindEvents: function () {
        var me = this;
        var timer = null;
        // 监听滚动
        me.scroll.on('scroll', function () {
            var target = this;
            me.checkReload(target);
            me.checkMore(target);

            clearTimeout(timer);

            timer = setTimeout(function () {
                me.pagination && me.pagination.process(target.y);
            }, 10);
        });

        me.scroll.on('scrollStart', function () {

            // 允许重新刷新，设置滚动到指定位置，scrollEnd 必须要再进行一次设置
            me._reloadAllow = false;
            me._reloadFailed = false;
        });

        // 监听滚动结束
        me.scroll.on('scrollEnd', function () {
            // 允许重新刷新，设置滚动到指定位置，scrollEnd 必须要再进行一次设置
            if (me._reloadFailed) {
                me.scroll.scrollTo(0, 30);
            }
        });

        // 监听一下 进入 重载界定 到 touchend 的鼠标 touch 时长
        $(document).off('touchend').on('touchend', function () {
            me.reloadEndTime = +new Date();

            // 准备进行数据重载
            if (me._reloadRange === true) {
                me._reloadAllow = true;
                me.dataLoader.statusChange('reload', 'process');
                me.getReloadData();
            }
        });
    },

    reset: function () {

        // 重置参数
        this._reloading = false;
        this._reloadRange = false;
        this._moring = false;
    },

    /**
     * 重新加载数据
     *
     * @param {Function} callback, 回调
     */
    getReloadData: function (callback) {
        var me = this;

        me.dataLoader.requestReload()
            .done(function (data, unchanged) {

                // 最新数据没有变化，不进行后面的 dom 操作
                if (unchanged) {
                    return;
                }

                // 用于分页提示
                data.pagenum = this.page;

                me.renderMain(this, data);

                me.setBasic();
                me.scroll.refresh();
                me.reset();
            })
            .fail(function () {
                me._reloadFailed = true;
                me.reset();
            })
            .always(function () {
                callback && callback();
            });
    },

    /**
     * 获取更多数据
     *
     * @param {Function} callback, 回调
     */
    getMoreData: function (callback) {
        var me = this;

        me.dataLoader.requestMore(function (err, data) {

            if (err || !data) {

                /**
                 * 离线机制
                 */
                if (!util.isNetwork()) {
                    var offlineData = coll.find({
                        rid: rid,
                        status: me.opts.status
                    });

                    me.renderMain(me.dataLoader, offlineData);

                    me.setBasic();

                    me.offline();
                    // 初始化滚动
                    me.initScroll();

                    // 初始化了数据之后，直接禁用 loader
                    me.dataLoader.disable();

                    return;
                }

                callback && callback(null);
                return;
            }

            // 设置加载更多的标记
            me._moring = false;
            // 用于分页提示
            data.pagenum = this.page;

            me.renderMain(this, data, 'append');

            me.setBasic();

            callback && callback(data);

            // 请求新数据之后，重新查找分页提示的 dom
            me.pagination.complete();
        });
    },

    renderUser: function (jids) {
        var me = this;
        var dfdPub = users.getUserInfo(jids);

        dfdPub
            .done(function (pubData) {
                if (pubData && pubData.contacts) {
                    new Pharos(me.$wrapper, {list: pubData.contacts});
                }
                else {
                    // me.failUser();
                }
            })
            .fail(function () {
                // me.failUser();
            });
    },

    /**
     * 渲染主体部分
     *
     * @param {Function} loader, dataLoader
     * @param {Object} data, 数据
     * @param {string} appendType, append 方式
     */
    renderMain: function (loader, data, appendType) {
        if (!data) {
            return;
        }

        var me = this;

        dealData(data);

        loader.render(data, appendType || 'html');

        var jids = getJids(data.objList);

        // 这里监听 设备是否就绪
        if (!window.isDeviceready) {
            clearInterval(me._deviceTimer);
            clearTimeout(me._deviceTimeout);
            me._deviceTimer = setInterval(function () {

                if (window.isDeviceready) {
                    clearInterval(me._deviceTimer);
                    clearTimeout(me._deviceTimeout);
                    me.renderUser(jids);
                }
            }, 100);

            me._deviceTimeout = setTimeout(function () {
                clearInterval(me._deviceTimer);
            }, 2000);
        }
        else {
            me.renderUser(jids);
        }
    },

    /**
     * 页面离线事务
     */
    offline: function () {
        // $('#main').off('click');
        // $('.page-loader li').off('click');
        $('.search-in').off('click');
    },



    reloadStartTime: 0,
    reloadEndTime: 0,

    /**
     * 检查是否需要重新加载数据
     *
     * @param {Element} scroll, new Scroll() 返回的scroll 实例
     */
    checkReload: function (scroll) {
        var me = this;

        // 如果已经允许重载，则不再进行状态设置
        if (me._reloadAllow) {
            scroll.scrollTo(0, 30);
        }
        if (me._reloadFailed) {
            me.scroll.scrollTo(0, 30);
        }

        if (me._reloadFailed || me._reloadAllow) {
            return;
        }

        if (scroll.y > 0 && me._reloading === false && me._reloadRange === false) {
            me.dataLoader.statusChange('reload', 'default');
        }

        // 到达临界点
        if (scroll.y >= 80 && me._reloading === false) {
            me.dataLoader.statusChange('reload', 'holder');

            me.reloadStartTime = +new Date();

            // 允许重载
            me._reloadRange = true;
        }
        // 脱离重载临界值
        else {
            me._reloadRange = false;
        }
    },

    /**
     * 检查是否需要加载更多
     *
     * @param {Element} scroll, new Scroll() 返回的scroll 实例
     */
    checkMore: function (scroll) {
        var me = this;

        if (scroll.maxScrollY - scroll.y > 60 && me._moring === false) {

            me.getMoreData(function () {
                // 刷新滚 iscroll
                me.scroll.refresh();
            });

            me._moring = true;
        }
    },

    /**
     * Destroy
     *
     */
    destroyScroll: function () {

        if (this.scroll) {
            this.scroll.destroy();
            this.scroll = null;
        }
    }
};

module.exports = Init;
