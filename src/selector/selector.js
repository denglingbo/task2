/**
 * @file selector.js
 * @author hefeng
 * 选人组件页
 *
 */

var Page = require('common/page');
var page = new Page();

require('dep/ui/selector/css/selector.css');
var Mustache = require('dep/mustache');
/* eslint-disable */
window.Mustache = Mustache;
/* eslint-enable */
require('dep/ui/selector/js/static/mbreq');
require('dep/touch');
var selector = require('dep/ui/selector/js/selector');

page.enter = function () {

};

page.deviceready = function () {
    selector();
};

page.start();
