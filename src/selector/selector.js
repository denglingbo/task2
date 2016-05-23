/**
 * @file selector.js
 * @author hefeng
 * 选人组件页
 *
 */
require('dep/ui/selector/css/selector.css');
var Mustache = require('dep/mustache');
/* eslint-disable */
window.Mustache = Mustache;
/* eslint-enable */
require('dep/ui/selector/js/static/mbreq');
require('dep/ui/selector/js/selector');

var Page = require('../common/page');
var page = new Page({
    pageName: 'selector-selector'
});

page.enter = function () {

};

page.bindEvents = function () {

};

$(function () {
    page.start();
});
