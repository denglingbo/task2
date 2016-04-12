
var LoadPage = function (selector, config) {

    if (!config && !$.isArray(config)) {
        console.warn('loadPage.js config not array.');
        return;
    }

    this.$items = $(selector);
    this.$pages = $('.load-page');

    this.config = config;

    this.init();
};

LoadPage.prototype = {

    init: function () {

    }
};

module.exports = LoadPage;