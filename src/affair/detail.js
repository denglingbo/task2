/**
 * @file detail.js
 * @author deo
 *
 * 事件详情页
 */
// var Mustache = require('dep/mustache');
// var CommonTpl = require('common/widgets/edit/new');
// console.log(CommonTpl)
require('./detail.scss');
require('dep/ui/virtualInput/virtualInput.scss');

require('dep/plugins/attaches/css/attaches.css');

var config = require('../config');
// var util = require('../common/util');
var detailUtil = require('common/widgets/detail/detail.js');
// var phoneMid = require('../common/phoneMid.js');
var Page = require('common/page');
var virtualInput = require('dep/ui/virtualInput/virtualInput');

// hefeng 上传组件
var plugins = require('common/plugins');
var editCommon = require('common/widgets/edit/editCommon');

var page = new Page();


// 初始化附件组件
var attachOptions = {
    // 客户端信息
    clientMsg: {
        uid: '1',
        cid: '1',
        client: '',
        lang: '',
        pause: '',
        appver: '111.1.1'
    },
    // 已经有的附件信息, 没有传空数组, 这个主要是用于修改
    originAttaches: [],
    url: {
        uploadUrl: {
            url: '/mgw/approve/attachment/getFSTokensOnCreate',
            mothod: 'POST'
        },
        resumeUrl: {
            url: '/mgw/approve/attachment/getFSTokensOnContinue',
            mothod: 'POST'
        }
    },
    supportType: [
        // 本地文件
        1,
        // 网盘文件
        2,
        // 相册图片
        3,
        // 拍照上传
        4,
        // 语音上传
        5
    ],
    dom: {
        // 附件容器DOM元素
        containerDOM: '#attachList',
        addBtnDOM: '#addAttach'
    },
    operateType: 'upload',
    attachesCount: 10,
    callback: function () {}
};

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

    this.render('#detail-main', this.data);
// var dataa = {
//     firstName: "Christophe",
//     lastName: "Coenraets",
//     address: "1 Main street",
//     city: "Boston",
//     state: "MA",
//     zip: "02106",
//         view: {
//             placeholder: 'ha ha'
//         }
// };

// var template = "<h1>{{firstName}} {{lastName}}</h1>";

// var hh = Mustache.to_html(template, dataa, {
//     newCommon: CommonTpl
// });
// console.log(hh)
    virtualInput('.goalui-fixedinput');

    this.bindEvents();

    plugins.initAttach(attachOptions, editCommon.transKey(testArr), '.comments-attach');

};

page.bindEvents = function () {

    this.$more = $('#affair-talk-more-handler');
    this.$affairTalk = $('#affair-talk');

    var CLASSES = {
        UNTICK: 'untick',
        TICKED: 'ticked',
        CIRCLE_SQUARE: 'tick-circle-to-square',
        TICKED_ANIMATE: 'tick-ticked-animate',
        SQUARE_CIRCLE: 'tick-square-to-circle',
        UNTICK_ANIMATE: 'tick-untick-animate'
    };

    $('.tick').on('click', function () {

        var $elem = $(this);

        // 勾选
        if ($elem.hasClass(CLASSES.UNTICK)) {
            $elem
                .removeClass(CLASSES.UNTICK)
                .removeClass(CLASSES.TICKED)
                .removeClass(CLASSES.UNTICK_ANIMATE)
                .removeClass(CLASSES.SQUARE_CIRCLE)
                .addClass(CLASSES.CIRCLE_SQUARE)
                .addClass(CLASSES.TICKED_ANIMATE);
        }
        // 取消勾选
        else {
            $elem
                .addClass(CLASSES.UNTICK)
                .addClass(CLASSES.TICKED)
                .removeClass(CLASSES.CIRCLE_SQUARE)
                .removeClass(CLASSES.TICKED_ANIMATE)
                .addClass(CLASSES.UNTICK_ANIMATE)
                .addClass(CLASSES.SQUARE_CIRCLE);
        }
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
    var promise = page.post(config.API.AFFAIR_DETAIL_URL);

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
