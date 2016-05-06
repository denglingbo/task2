/**
 * @file detail.js
 * @author deo
 *
 * 事件详情页
 */
require('dep/plugins/attaches/css/attaches.css');

require('./detail.scss');
require('common/ui/virtualInput/virtualInput.scss');

var config = require('../config');
var util = require('../common/util');
var detailUtil = require('common/widgets/detail/detail');
// var phoneMid = require('../common/phoneMid.js');
var Page = require('common/page');
var virtualInput = require('common/ui/virtualInput/virtualInput');

var Ticker = require('common/ui/ticker/ticker');

var tmplTitle = require('common/widgets/detail/title');
var tmplDescribe = require('common/widgets/detail/describe');

var page = new Page();

/* eslint-disable */
var testArr = [
    {
        deleted: false,
        dfs_path: '00012AE75593C73341F7927F567E0C49AD6D',
        file_name: 'ca1.crt',
        size: 1391
    },
    {
        deleted: false,
        dfs_path: '00012AE75593C73341F7927F567E0C49AD6D',
        file_name: 'cb2.crt',
        size: 1311
    }
];
/* eslint-enable */

page.enter = function () {

    this.data.describeTitle = '事件描述';
    this.render('#detail-main', this.data, {
        partials: {
            title: tmplTitle,
            describe: tmplDescribe
        }
    });

    virtualInput('.goalui-fixedinput');

    this.bindEvents();
    this.attach = detailUtil.initDetailAttach(testArr, '.comments-attach');
};

page.bindEvents = function () {

    this.$more = $('#affair-talk-more-handler');
    this.$affairTalk = $('#affair-talk');

    new Ticker('.tick');
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
    var promise = page.post(config.API.AFFAIR_DETAIL_URL, {
        affair_id: util.params('id')
    });
    /* eslint-enable */

    promise
        .done(function (result) {
            var data = detailUtil.dealPageData(result);

            if (data === null) {
                dfd.reject(data);
            }
            else {
                me.data = data;
                dfd.resolve(data);
            }

        });

    return dfd;
});

$(function () {
    page.start();
});
