/**
 * @file initScroll.js
 * @author deo
 *
 * 初始化滚动 test [没有实现完成]
 */

var config = require('../../config');
// var util = require('common/util');
var raw = require('common/widgets/raw');
var users = require('common/middleware/users/users');
var Pharos = require('common/ui/pharos');
var DataLoader = require('common/ui/dataLoader/dataLoader');
var util = require('common/util');
// 页码提示
// require('common/ui/pagination/pagination.scss');
// var Pagination = require('common/ui/pagination/pagination');

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

        onFirstDone: function () {}

        // onPaginationDone: function () {}
    };

    $.extend(me.opts, options);

    // me.lang = {
    //     'doing': me.opts.lang.loading,
    //     'done': me.opts.lang.dataDone,
    //     'default': me.opts.lang.getMore
    // };

    me.$wrapper = $(me.opts.wrapper);
    me.$main = me.$wrapper.find(me.opts.main);

    me.$loader = me.$wrapper.find('.data-more');
    me._loaderHeight = me.$loader.height();

    me._deviceTimer = null;
    me._deviceTimeout = null;

    me.init();
}

Init.prototype = {

    init: function () {
        var me = this;
        var lang = me.opts.lang;

        // 这里的分页请求由 dataLoader 来处理
        me.dataLoader = new DataLoader({
            promise: me.opts.promise,
            dataKey: 'objList',
            wrapper: me.$main,
            scrollWrapper: me.$wrapper,
            errTpl: errTpl,
            lang: {
                more: {
                    'default': lang.touchLoadMore,
                    'process': lang.loading,
                    'done': lang.dataDone,
                    'fail': lang.loadFailTryAgain,
                    'max': lang.contentLoadAllReadey,
                    'nodata': lang.nowNowData
                },
                reload: {
                    'default': lang.dropDownRefresh,
                    'process': lang.loading,
                    'done': lang.dataDone,
                    'fail': lang.loadFailTryAgain,
                    'holder': lang.releaseRefresh,
                    'unchanged': lang.alreadyLastestData
                }
            },
            moreNullHidden: true,
            tpl: me.opts.tpl,
            reloadHandler: me.$wrapper.find('.data-reload'),
            moreHandler: me.$wrapper.find('.data-more')
        });

        me.dataLoader.on('scrollMore', function (event, loader) {
            me.getMoreData();
        });

        me.dataLoader.on('scrollReload', function (event, loader, refresh) {
            me.getReloadData(loader, refresh);
        });

        me.getFirst();

        // var timer = null;

        // 刷新页数提示
        // me.dataLoader.on('scrolling', function (event, loader, target) {
        //     clearTimeout(timer);

        //     timer = setTimeout(function () {
        //         me.pagination && me.pagination.process(target.y);
        //     }, 37);
        // });
    },

    /**
     * 初始化第一个
     */
    getFirst: function () {
        var me = this;

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

            me.opts.onFirstDone(data);

            if (data.objList && data.objList.length <= 0) {
                me.opts.onDataNull && me.opts.onDataNull(me.dataLoader);
            }

            // // 初始化一个分页提示控件
            // me.pagination = new Pagination({
            //     wrapper: me.$wrapper,
            //     // 每个数据容器
            //     elems: '.list-item',
            //     // data-pagenum，数据来源
            //     finder: 'pagenum',
            //     pageNum: data.number,
            //     // 可视偏移量
            //     offset: -60,
            //     total: data.total,
            //     // 在屏幕下方作为展示的基准点
            //     screen: 1
            // });

            // me.opts.onPaginationDone.call(me);
        });
    },

    /**
     * 基础设置
     */
    setBasic: function () {

        var me = this;

        // 设置下高度
        var viewHeight = $(window).height() - ($('#search').length ? $('#search').height() : 0);

        // 设置滚动的元素的高宽
        $('.slider-container').css({
            width: $(window).width(),
            height: viewHeight
        });

        var $err = me.opts.wrapper.find('.net-err');
        if ($err.length > 0) {
            $err.addClass('hide').remove();
        }

        var height = $(window).height();

        // 这里要先获取高度
        var objHeight = me.$main.height() + me.opts.offset;

        if (me.$loader.hasClass('hide')) {
            // 如果加载条被隐藏，这里要减去加载条的高度，同时 + 需要漏出的边距
            objHeight = objHeight - me._loaderHeight + 15;
        }

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

    /**
     * 重新加载数据
     *
     * @param {Function} loader, dataLoader
     * @param {boolean} refresh, 是否直接刷新，不通过 unchanged 的判断
     */
    getReloadData: function (loader, refresh) {
        var me = this;

        me.dataLoader.requestReload(refresh)
            .done(function (data, unchanged) {

                // 最新数据没有变化，不进行后面的 dom 操作
                // 如果不需要强制刷新，同时数据没有变化
                // 重载页面之后 task/list.js 会直接调用 dataLoader.fire('scrollReload', null, true);
                if (!refresh && unchanged) {
                    return;
                }

                // 用于分页提示
                data.pagenum = this.page;

                me.renderMain(this, data);

                me.setBasic();
                me.dataLoader.scroll.refresh();

                // 返回刷新
                if (refresh) {
                    setTimeout(function () {
                        me.dataLoader.scroll.scrollTo(0, 0, 100);
                    }, 100);
                }
            })
            .fail(function () {})
            .always(function () {});
    },

    /**
     * 获取更多数据
     *
     * @param {Function} callback, 回调
     */
    getMoreData: function (callback) {
        var me = this;

        var $err = me.opts.wrapper.find('.net-err');
        if ($err.length > 0) {
            $err.addClass('hide').remove();
        }

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
                    // me.initScroll();

                    // 初始化了数据之后，直接禁用 loader
                    me.dataLoader.disable();

                    return;
                }

                callback && callback(null);
                return;
            }

            // 用于分页提示
            data.pagenum = this.page;

            me.renderMain(this, data, 'append');

            me.setBasic();

            // me.dataLoader.scroll.refresh();

            callback && callback(data);

            // 请求新数据之后，重新查找分页提示的 dom
            // me.pagination.complete();
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

        // 去掉 content wrapper 的min-height
        if (data.total < 3) {
            me.$wrapper.find('.list-wrapper-content').css({
                'min-height': 'auto'
            });
        }

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
    }
};

module.exports = Init;
