/* eslint-disable */
var Control = require('common/control');

var Loader = function (options) {

    Control.call(options);

};

$.extend(Loader.prototype, Control.prototype);

$.extend(Loader.prototype, {

    page: 1,
    startTime: 0,
    endTime: 0,

    reqesut: function () {

    }

});

module.exports = Loader;
