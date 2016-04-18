/**
 * @file page.js
 * @author deo (denglingbo@126.com)
 *
 */

var config = require('../config');
var Mustache = require('dep/mustache');

/**
 * Page
 *
 * @param {Object} opts 参数
 * @constructor
 */
function Page(opts) {

    /**
     * Tasks
     * @type {Array<Function>}
     */
    this.tasks = [];

    /**
     * 页面数据
     */
    this.data;

    /**
     * 保存上一个页面传过来的数据
     */
    this._data;

    /**
     * 得到上一个页面的params
     */
    this.params;

    /**
     * 标识页面是否调用过done方法
     * @type {Boolean}
     */
    this.isDone = false;
}


/**
 * 所有前序任务执行完毕之后，回调 enter
 *
 */
Page.prototype.enter = function () {};

/**
 * 开始执行任务
 *
 * @return {Deferred}
 */
Page.prototype.start = function () {
    var me = this;

    var dfd = new $.Deferred();

    // 增加编译模板的任务
    if (!me.isDone) {
        // me.addParallelTask(function (dfd) {

        //     // 如果页面在这之前已经done过了，那就不继续编译
        //     // do something

        //     dfd.resolve();
        // });
    }

    dfd.done(function () {
        // 执行任务
        me.execute()
            .done(function () {
                me.enter();
            })
            .fail(function () {
                // Do something
            });
    })
    .fail(function () {
        // Do something
    });

    (function (params) {
        me._data = params;
        dfd.resolve();
    })();

    return dfd;
};


/**
 * Done
 */
Page.prototype.done = function () {
    this.isDone = true;
};

/**
 * 执行任务
 *
 * @return {Deferred}
 */
Page.prototype.execute = function () {
    var dfds = [];

    this.tasks.forEach(function (task) {
        dfds.push(task.$dfd);
        task();
    });

    return $.when.apply(null, dfds);
};

/**
 * 添加伪并行任务
 *
 * task第一个函数需要是 deferred，如下
 * ```javascript
 * page.addParallelTask(function (dfd) {
 *     dfd.resolve('success');
 * });
 * ```
 *
 * @param {Function} task 任务函数
 * @return {Page} 返回自身
 *
 */
Page.prototype.addParallelTask = function (task) {
    var me = this;
    var dfd = new $.Deferred();

    var fn = function () {
        task.call(me, dfd);
    };
    fn.$dfd = dfd;

    // 缓存任务函数
    fn.task = task;

    me.tasks.push(fn);

    return me;
};

/**
 * 渲染模板
 *
 * @param {string} selector, #id|.class|tagname
 * @param {Loader} template, [name]-loader
 * @param {Object} data, 数据
 * @return {string} html 字符串
 *
 */
Page.prototype.render = function (selector, template, data) {
    var str = template(data);
    $(selector).html(str);

    return str;
};

/**
 * Mustache 渲染模板
 * 模板输出 dom $(selector), 模板源: selector'-template'
 *
 * @param {string} selector, #id|.class|tagname
 * @param {Object} data, 数据
 *
 */
Page.prototype.renderTarget = function (selector, data) {
    var $elem = $(selector);
    var $temp = $(selector + '-template');

    if (!$elem.length || !$temp.length) {
        return;
    }

    var template = $temp.html();
    var html = Mustache.render(template, data);

    $elem.html(html);
};

/**
 * 获取请求参数并可以根据需求改变参数
 *
 * @param {number} api, 接口
 * @param {Object} data, 数据
 * @return {Object}
 *
 */
var getRequestData = function (api, data) {
    var r = {};
    if (config.debug) {
        r.url = config.mockUrl + '/api?id=' + api;
    }
    return r;
};

/**
 * Post 请求数据
 *
 * @param {number} api api号
 * @param {Object=} data 请求数据
 * @param {Object=} opts 选项
 * @param {string} opts.url 请求的host
 *
 * @return {Deferred}
 */
Page.prototype.post = function (api, data, opts) {
    var dfd = new $.Deferred();
    var reqData = getRequestData(api, data);

    opts = opts || {};

    var promise = $.ajax({
        type: 'post',
        url: reqData.url,
        data: reqData.data
    });

    // 请求完成
    promise.done(function (result, status, xhr) {
        dfd.resolve(result);
    });

    // 请求失败
    promise.fail(function (xhr, errorType, error) {
        dfd.reject(error);
    });

    return dfd;
};

module.exports = Page;
