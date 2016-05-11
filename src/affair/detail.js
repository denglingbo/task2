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
var AttachWrapper = require('common/middleware/attach/attachWrapper');

var page = new Page();

page.enter = function () {
    var me = this;
    this.data.describeTitle = '事件描述';
    this.render('#detail-main', this.data, {
        partials: {
            title: tmplTitle,
            describe: tmplDescribe
        }
    });

    virtualInput('.goalui-fixedinput');

    this.bindEvents();
    /* eslint-disable */
    this.attach = AttachWrapper.initDetailAttach({
        attachData: me.data.attachs, 
        container: '.attach-container', 
        wrapper: '.attach'
    });
    /* eslint-enable */
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
    var promise = page.get(config.API.AFFAIR_DETAIL_URL, {
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
