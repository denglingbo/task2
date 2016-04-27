/**
 * @file page.js
 * @author deo (denglingbo@126.com)
 *
 */

var config = require('../config');
var view = require('./ui/view');
var util = require('./util');
var storage = require('./localstorage');

if (!window.pageLog) {
    window.pageLog = {};
}

/**
 * 不储存空数据
 *
 * @param {string} key, url query key
 * @return {string|null}
 */
var checkParamNull = function (key) {
    var ls = storage.getData(config.const.TASK_PARAMS);
    var param = $.trim(util.params(key));
    var lsData = ls && ls[key] ? ls[key] : '';

    if (param === undefined || param === null || param.length <= 0) {

        if (lsData) {
            return lsData;
        }

        return '';
    }

    return param || lsData;
};

/**
 * 储存基础数据
 *
 * @return {Object}
 */
var getParams = function () {

    var data = {
        // uid 人员id
        uid: checkParamNull('uid'),
        // cid 公司id
        cid: checkParamNull('cid'),
        // lang 语言类型
        lang: checkParamNull('lang') || 'zh_CN',
        // client 客户端类型
        client: checkParamNull('client')
    };

    storage.addData(config.const.TASK_PARAMS, data);

    return data;
};

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
        window.pageLog.compileTemplateStart = Date.now();
        me.addParallelTask(function (dfd) {
            // 如果页面在这之前已经done过了，那就不继续编译
            $('[type="x-tmpl-mustache"]').each(function (index, node) {
                view.getRenderer(node.innerHTML);
            });
            window.pageLog.compileTemplateEnd = Date.now();
            dfd.resolve();
        });
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

    // -------------------------------------
    // 这里不适用于所有环境，此处为 cordova 服务
    // 等待 deviceready 完成
    // -------------------------------------
    window.pageLog.devicereadyStart = +new Date();
    document.addEventListener('deviceready', function () {
        me._data = getParams();
        dfd.resolve();
    }, false);
    window.pageLog.devicereadyEnd = +new Date();

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
 * 渲染模板文件
 *
 * @param {string} selector, #id|.class|tagname
 * @param {Loader} template, [name]-loader
 * @param {Object} data, 数据
 * @return {string} html 字符串
 *
 */
Page.prototype.renderFile = function (selector, template, data) {
    var str = template(data);
    $(selector).html(str);

    return str;
};

/**
 * 渲染模板
 *
 * @param {string} selector, #id|.class|tagname
 * @param {Object} data, 数据
 * @param {string} appendType, append, befre, after, ..., 默认值为 html
 * @return {string} html 字符串
 *
 */
Page.prototype.render = function (selector, data, appendType) {
    var str = view.render(selector, data, appendType);

    return str;
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

    r.data = {
        id: api
    };

    $.extend(r.data, data);

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

    var host = config.API.host + config.API.prefix;

    var promise = $.ajax({
        type: 'post',
        url: host,
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
