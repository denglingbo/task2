/**
 * @file detail.js
 * @author deo
 * 任务详情页
 *
 */

require('./detail.scss');
require('common/ui/fixer/fixer.scss');

var config = require('../config');
var detailUtil = require('common/widgets/detail/detail');
var phoneMid = require('common/phoneMid');
var ClickLoader = require('common/ui/clickLoader/clickLoader');
var Page = require('common/page');
// 定位器
var Fixer = require('common/ui/fixer/fixer');

var page = new Page();

page.enter = function () {
    var me = this;

    me.$main = $('.main');

    me.render('#detail-main', me.data);

    // 初始化一个点击加载组件
    me.clickLoader = new ClickLoader({
        promise: function () {
            return page.post(config.API.AFFAIR_TALK_MORE_URL);
        },
        pageNum: 10
    });

    me.bindEvents();
};

page.bindEvents = function () {
    var me = this;

    me.$more = $('#affair-talk-more-handler');
    me.$affairTalk = $('#affair-talk');
    me.$fixbar = $('.fixbar');

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
            CPNavigationBar.redirect('/' + pageTo + '/detail.html');
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
    me.clickLoader.on('complete', function (loader, data) {

        me.fixer = new Fixer({
            elems: '#affair-talk dd',
            // data-pagenum，数据来源
            finder: 'pagenum',
            pageNum: 10,
            // 可视偏移量
            offset: -44,
            total: data.total
        });
    });

    me.clickLoader.on(['complete', 'loadmore'], function (loader, data) {

        // Mustache.js 的逗比之处
        // {{#list}}
        //  中无法获取到 list 同级的数据，类似当前这个 data.pagenum, ...
        // {{/list}}
        data.pagenum = function () {
            // return data.page;
            return loader.page;
        };

        me.render('#affair-talk', data, 'append');

        // 分页要放在render 之后
        me.fixer.update();
    });


};

/**
 * 查找某子对象是否属于源数据对象，同时把对应的数据附加到 appendObject 上
 *
 * @param {Object} srcObject, 源数据对象
 * @param {Object} itemObject, 子对象
 * @param {Object} appendObject, 匹配到某对象上
 *
 */
page.findOwner = function (srcObject, itemObject, appendObject) {

    if (itemObject && itemObject.jid) {

        var id = parseInt(phoneMid.takeJid(itemObject.jid), 10);

        for (var key in srcObject) {
            if (srcObject.hasOwnProperty(key)) {

                var objIds = srcObject[key];

                if ($.isArray(objIds) && $.inArray(id, objIds) !== -1) {

                    var appender = appendObject[key];
                    if (!$.isArray(appender)) {
                        appendObject[key] = [];
                    }

                    appendObject[key].push(itemObject);
                }
                // 非数组直接判断是否相等
                else if (objIds === id) {
                    appendObject[key] = itemObject;
                }

            }
        }
    }
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

    var data = {
        creator: null,
        principal: null,
        partner: null
    };

    dataArr.forEach(function (item) {
        me.findOwner(originArr, item, data);
    });

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
            partnerJids.push(phoneMid.takeJid(item.jid));
        });

        if (partnerRaw.length) {
            dataRaw.partnerLength = partnerRaw.length;
        }

        dataRaw.partnerRaw = partnerRaw.join('、');
        dataRaw.partnerJids = partnerJids.join(',');
    }

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

    var promise = page.post(config.API.TASK_DETAIL_URL);

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

                var jids = phoneMid.makeArray(obj);
                var dfdPub = phoneMid.getUserInfo(jids, data.cid);

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
        .fail(function (a) {
            // console.log(a);
        });

    return dfd;
});

$(function () {
    page.start();
});
