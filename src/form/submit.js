/**
 * @file submit.js
 * @author deo
 *
 * 提交公用页面
 * 撤销，拒绝，...
 */

require('./submit.scss');

// var config = require('../config');
var Page = require('common/page');
var util = require('common/util');

var page = new Page();

var pages = {

    // 完成任务
    '0': function (isMaster) {
        var arr = [{
            name: 'summary',
            holder: '请输入任务总结(选填)'
        }];

        if (isMaster === 1) {
            arr.push({
                name: 'comments',
                holder: '请输入任务备注(选填)'
            });
        }

        return arr;
    },

    // 撤销
    '1': function () {
        return [{
            name: 'cancel',
            holder: '请输入撤销理由'
        }];
    },

    // 拒绝
    '2': function () {
        return [{
            name: 'oppose',
            holder: '请输入拒绝理由'
        }];
    },

    // 同意
    '3': function () {
        return [{
            name: 'agree',
            holder: '请输入同意理由'
        }];
    }
};

page.enter = function () {

    // 页面类型
    var pageType = util.params('type');

    // 判断是不是 master，完成总结的 master
    var isMaster = parseInt(util.params('master'), 10);

    // 获取当前页面配置
    var curPage = pages[pageType];

    // 如果没有问题就渲染对应模板
    if (curPage) {
        this.render('#main', {
            list: curPage(isMaster)
        });
    }

    this.bindEvents();
};

page.bindEvents = function () {

};

$(function () {
    page.start();
});