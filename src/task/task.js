/**
 * @file task.js
 * @author hefeng
 * 新建任务页
 *
 */

require('../widgets/edit/new.scss');
Mustache = require('dep/mustache');
require('dep/plugins/attaches/attaches');
var config = require('../config');
var Page = require('../common/page');

//  var CPNavigationBar = require('dep/campo-navigationbar/campo-navigationbar');

var page = new Page();

var valid = {
    title: false,
    content: true
};

var info = {
    title: '',
    comtent: '',
    master: '',
    canyuren: [],
    doneTime: 0,
    urgency: 0
};

/**
 * 验证不通过弹窗
 *
 * @param {string} info, 验证不通过的提示语句
 *
 */
// function validAlert(info) {
//     var $alertDom = $('.alert-length-limit');
//     $alertDom.text(info).removeClass('hide');

//     setTimeout(function () {
//         $alertDom.addClass('hide');
//     },
//     3000);
// }

/**
 * 选择完成时间跳转页面的回掉函数
 *
 */
// function chooseTimeCB() {
//     // require('./edit/done-time.scss');
// }
page.enter = function () {



    page.loadPage(this.data);
};

/**
 * 绑定事件
 *
 */
page.bindEvents = function () {
    var $titleDom = $('#edit-title');
    var $contentDom = $('#edit-content');

    /**
     * 切换关闭按钮的显示与隐藏
     *
     * @param {Object} textDom, 当前输入框dom对象
     * @param {number} textLength, 输入框内文字长度
     *
     */
    function toggleX(textDom, textLength) {
        if (!textLength) {
            $(textDom).parent().find('.close-x').addClass('hide');
        }
        else {
            $(textDom).parent().find('.close-x').removeClass('hide');
        }
    }

    $('.close-x').click(function () {
        var $parentDom = $(this).parent();
        $parentDom.find('.input').val('');
        $parentDom.find('.err-tip').text('');
        $(this).addClass('hide');
        if ($parentDom.hasClass('edit-title-wrap')) {
            valid.title = false;
        }
    });

    $titleDom.on('input propertychange', function () {
        var me = this;
        var length = $(me).val().length;
        var errTip = $(me).next('.err-tip');

        toggleX(me, length);

        if (!length || length > 50) {
            valid.title = false;
        }
        else {
            valid.title = true;
        }

        if (length > 50) {
            errTip.text(50 - length);
        }
        else {
            errTip.text('');
        }
    });

    $('.edit-title-wrap').click(function () {
        $titleDom.focus();
    });

    $contentDom.on('input propertychange', function () {
        var me = this;
        var length = $(me).val().length;
        var errTip = $(me).next('.err-tip');

        toggleX(me, length);

        if (length > 50000) {
            valid.content = false;
            errTip.text(50000 - length);
        }
        else {
            valid.content = true;
            errTip.text('');
        }
    });

    $('.edit-words').click(function () {
        $contentDom.focus();
    });

    // $('#doneTime').click(function () {
    //     CPNavigationBar.redirect('./edit/done-time.html', '完成时间', false, chooseTimeCB, info)
    // });

    var mobiOptions = {
        theme: 'android-holo-light',
        mode: 'scroller',
        // ios 底部上滑, android 中间显示
        display: (/(iphone|ipad)/i).test(navigator.appVersion) ? 'bottom' : 'modal',
        lang: 'zh',
        buttons: ['cancel', 'set'],
        height: 50
    };

    $('#urgencyBlock').mobiscroll().select($.extend({}, mobiOptions, {
        headerText: '紧急程度',
        showInput: false,
        showMe: true,
        rows: 3,
        data: [
            {
                text: '重要且紧急',
                value: '0'
            },
            {
                text: '普通',
                value: '1',
                selected: true
            },
            {
                text: '重要',
                value: '2'
            },
            {
                text: '紧急',
                value: '3'
            }
        ],
        onSelect: function (text, inst) {
            info.urgency = +inst.getVal();
            $('#urgencyBlock .value').text(text);
        }
    }));
};

/**
 * 加载页面
 *
 * @param {Object} data, 当前要渲染的模板数据
 *
 */
page.loadPage = function (data) {
    var me = this;

    data = data || {};

    require.ensure(['../widgets/edit/edit'], function () {
        var template = require('../widgets/edit/edit');
        var $content = $('.edit-container');
        me.renderFile($content, template, $.extend({}, data, {
            view: {
                task: true,
                event: false,
                discussion: false,
                placeholder: '任务',
                data: []
            }
        }));

        var attache = new Attach({
            // 客户端信息
            clientMsg:{
                uid: '1',
                cid: '1',
                client: '',
                lang: '',
                pause: '',
                appver: '111.1.1'
            },
            // 已经有的附件信息，没有传空数组，这个主要是用于修改
            originAttaches:[
                {
                   id: 0, // 附件id

                   fileName: data['file_name'], // 附件名称
                   size: data.size, // 附件大小

                }
            ],
            url:{ 
                uploadUrl: {
                    url: '/mgw/approve/attachment/getFSTokensOnCreate',
                    mothod: 'POST'
                },
                resumeUrl: {
                    url: '/mgw/approve/attachment/getFSTokensOnContinue',
                    mothod: 'POST'
                }
            },
            supportType:[
                1, // 本地文件
                2, // 网盘文件
                3, // 相册图片
                4, // 拍照上传
                5 // 语音上传
            ],
            dom: {
                containerDOM: $('.edit-add-attach') // 附件容器DOM元素
            },
            callback: function(){}
        });
        var renderString = Attach.getRenderString({attach: [
            $.extend({}, data.attachements[0], {
                id:'12321',
                fileName: data.attachements[0]['file_name']
            })
        ]},'11.1.1');
        $('.edit-add-attach').append(renderString.attach);
        Attach.initEvent('.edit-add-attach', 'zh_CN');

        me.bindEvents();
    });
};

/**
 * 编辑页面加载数据
 *
 */
function editAjax() {

    /**
     * 请求页面接口
     *
     * @param {deferred} dfd, deferred
     *
     */
    page.addParallelTask(function (dfd) {
        var me = this;
        var promise = page.post(config.API.TASK_EDIT_URL, {});

        promise
            .done(function (result) {
                if (result.meta !== 0) {
                    dfd.reject(result);
                }
                else {
                    me.data = result.data;
                    dfd.resolve();
                }
            });
    });
}

editAjax();

$(function () {
    page.start();
});
