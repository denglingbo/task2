/* eslint-disable */

/**
 * @file task.js
 * @author hefeng
 * 新建任务页
 *
 */

require('../common/widgets/edit/new.scss');
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
    id: '',
    title: '',
    comtent: '',
    principalUser: 0,
    attendIds: [],
    endTime: 0,
    importanceLevel: 0
};

var principalSelectKey = 'principalSelector';
var attendSelectKey = 'attandSelectKey';
var selectValue = {
    "clientMsg": {
        "uid": "",
        "cid": "",
        "client": "",
        "lang": "",
        "puse": "",
        "appver": ""
    },
    "selector": {
        "contact": 3,   //选择人
        "dept": 0,      //选择部门
        "title": 0      //选择职务
    },
    "selectType": 2,    //选择组件类型：1.单选 2.复选
    "filter": {         //指定的过滤数据
        "disabled": {   //指定不显示的数据
            "contacts": [],
            "depts": [],
            "titles": []
        },
        "enabled": {    //指定显示的数据
            "depts": [],
            "titles": []
        },
        "checked": {   //已选择的数据
            "contacts": [],     //数组
            "depts": [],
            "titles": []
        }
    },
    "dataSource": 1,    //数据源：1.通过原生插件获取 2.从移动网关服务器获取
    "requestInfo":{     //从移动网关获取数据的请求信息
        "type": "get",             //请求方式
        "data": "",                //请求发送的数据
        "url": "",     //请求的url
        "headers": {}
    }
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
 * 转换string驼峰
 *
 * @param {string} str, 需要转换的字符串
 *
 */
function camelCase(str) {
    return str.replace(/_+(.)?/g, function (str, e) {
        return e ? e.toUpperCase() : "";
    });
}

/**
 * 附件传入data key转为 camelCase
 *
 * @param {Array} arr, 附件传入data
 *
 */
function transKey(arr) {
    var newArr = [];
    if ($.isArray(arr)) {
        newArr = arr;
    }
    else if (arr instanceof Object) {
        newArr.push(arr);
    }
    var outArr = [];
    var newObj = {};
    for (var i = 0, len = newArr.length; i < len; i++) {
        var item = newArr[i];
        newObj = {};
        for (var key in item) {
            if (item.hasOwnProperty(key)) {
                newObj[camelCase(key)] = item[key];
            }
        }
        outArr.push(newObj)
    }
    return outArr;
}

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

page.enter = function () {

    page.loadPage(this.data);

    // TODO 修改存储数据
    window.localStorage.setItem(principalSelectKey, JSON.stringify(selectValue));
    window.localStorage.setItem(attendSelectKey, JSON.stringify(selectValue));
};

/**
 * 绑定事件
 *
 */
page.bindEvents = function () {
    var me = this;
    var $titleDom = $('#edit-title');
    var $contentDom = $('#edit-content');

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

    // 完成时间跳转页面
    $('#doneTime').click(function () {
        CPNavigationBar.redirect('./doneTime.html?endTime=' + me.data['end_time'], '完成时间', false, function (data) {
            if (data) {
                data = JSON.parse(data);
            }
            // TODO
        });
    });

    // 选择人员跳转页面
    $('#principal, #attends').click(function (e) {
        var key = e.target.id === 'principal' ? principalSelectKey : attendSelectKey;
        CPNavigationBar.redirect('../selector/selector.html?paramId=' + key, '选人', false, function (data) {
            if (data) {
                data = JSON.parse(data);
            }
            // TODO
        });
    });
    
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

    require.ensure(['../common/widgets/edit/edit'], function () {
        var template = require('../common/widgets/edit/edit');
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

        // 初始化附件组件
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
            originAttaches:[],
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
                containerDOM: $('.attach-list') // 附件容器DOM元素
            },
            callback: function(){}
        });
        var renderString = Attach.getRenderString({attach: transKey(data.attachements)},'11.1.1');
        $('.attach-list').append(renderString.attach);
        Attach.initEvent('.attach-list', 'zh_CN');

        // 设置默认值
        var importanceLevel = ['重要且紧急', '普通', '重要', '紧急'];
        $('#urgencyBlock .value').text(importanceLevel[data['importance_level']]);
        $('#doneTime .value').text(data['end_time'] ? new Date(data['end_time']) : '尽快完成');

        // 初始化文本框的关闭按钮
        $.each($('.input'), function (index, item) {
            toggleX($(item), $(item).val());
        });

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
