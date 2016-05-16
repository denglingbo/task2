/* eslint-disable */
var config = require('common/util');
var tmpl = require('./list.tpl');

var Loader = require('common/ui/loader');

var loader;

var init = function (options) {
    console.log(options);

    loader = new Loader(options);
};

module.exports = {
    init: init
};
