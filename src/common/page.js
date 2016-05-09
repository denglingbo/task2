/**
 * @file page.js
 * @author deo (denglingbo@126.com)
 *
 */

var config = require('../config');
var view = require('./ui/view');
var util = require('./util');
var users = require('./middleware/user/users');
var storage = require('./localstorage');

// ** 调用 jingoal 重写的 ajax 包 ** //
require('common/mbreq');

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
        // puse 区分平台
        puse: checkParamNull('puse'),
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
                // 通通拿出来编译一发
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
 * 渲染模板
 *
 * @param {string} selector, #id|.class|tagname
 * @param {Object} data, 数据
 * @param {string} options, see ui/view.js
 * @return {string} html 字符串
 *
 */
Page.prototype.render = function (selector, data, options) {
    var str = view.render(selector, data, options);
    return str;
};

/**
 * 用于 mock 添加 cookie
 *
 * @param {string} name, cookie 名
 * @param {string} value, name 对应的 value
 * @param {number} seconds, 有效时间
 * @param {string} path, 储存根位置
 */
function setCookie(name, value, seconds, path) {
    seconds = seconds || 0;
    path = path || '/';
    var expires = '';

    if (seconds !== 0) {
        var date = new Date();
        date.setTime(date.getTime() + (seconds * 1000));
        expires = '; expires=' + date.toGMTString();
    }

    document.cookie = name + '=' + escape(value) + expires + '; path=' + path;
}

/**
 * 获取请求参数并可以根据需求改变参数
 *
 * @param {Object} data, 数据
 * @return {Object}
 *
 */
var getRequestData = function (data) {

    if (!$.isPlainObject(data)) {
        return {};
    }

    var r = {};

    r = storage.getData(config.const.TASK_PARAMS);

    $.extend(r, data);

    return r;
};

Page.prototype.get = function (api, data, options) {
    return this.ajax(api, data, $.extend(options || {}, {type: 'GET'}));
};

Page.prototype.post = function (api, data, options) {
    return this.ajax(api, data, $.extend(options || {}, {type: 'POST'}));
};

/**
 * Ajax 请求数据
 *
 * @param {number} api api号
 * @param {Object} data 请求数据
 * @param {Object} options 选项
 *      @param {string} options.url 请求的host
 * @return {Deferred}
 */
Page.prototype.ajax = function (api, data, options) {

    var dfd = new $.Deferred();
    var isNetwork = users.isNetwork();

    if (!isNetwork) {
        dfd.reject({error: 'Connection None'});
        return dfd;
    }

    var reqData = getRequestData(data);

    var opts = {
        type: 'POST',
        dataType: 'json'
    };

    $.extend(opts, options);

    var host = config.API.host + config.API.prefix + api;

    var ajaxSettings = {
        type: opts.type,
        url: host,
        data: reqData,
        dataType: opts.dataType
    };

    if (config.debug) {
        setCookie('JINSESSIONID', config.mock.token);
        setCookie('uid', reqData.uid);
        setCookie('cid', reqData.cid);

        // debug & 由 node 转发的时候 和后端联调跨域的情况下需要加如下配置
        if (!/^\/data/.test(config.API.prefix)) {
            ajaxSettings.xhrFields = {
                withCredentials: true
            };
        }
    }

    var promise = $.ajax(ajaxSettings);

    // 请求完成
    promise.done(function (result, status, xhr) {
        // Just debug test
        // 模拟网络延迟
        if (config.debug) {
            setTimeout(function () {
                dfd.resolve(result);
            }, 200);
        }
        else {
            dfd.resolve(result);
        }
    });

    // 请求失败
    promise.fail(function (xhr, errorType, error) {
        dfd.reject(xhr, errorType, error);
    });

    return dfd;
};

module.exports = Page;
