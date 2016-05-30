/**
 * @file page.js
 * @author deo (denglingbo@126.com)
 *
 */

var config = require('../config');
var view = require('./view');
var util = require('./util');
var storage = require('./localstorage');
var lang = require('./lang');
var log = require('./log');
// var fastclick = require('dep/fastclick');
// var localcache = require('./localcache');
/* test cookie */
// var cookies = require('dep/cookies');

// ** 调用 jingoal 重写的 ajax 包 ** //
require('common/mbreq');

if (!window.pageLog) {
    window.pageLog = {};
    window.isDeviceready = false;
}

/**
 * 不储存空数据
 *
 * @param {string} key, url query key
 * @return {string|null}
 */
var checkParamNull = function (key) {
    var ls = storage.getData(config.const.TASK_PARAMS);

    if (!ls) {
        return '';
    }

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

    this.lang = lang.data;

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

    this.isFailed = false;

    this.opts = opts;

    this.domContentListener();

    // 监听设备就绪
    this.deviceListener();
}

/**
 * 所有前序任务执行完毕之后，回调 enter
 *
 */
Page.prototype.enter = function () {};

/**
 * 设备就绪，回调 deviceready
 *
 */
Page.prototype.deviceready = function () {};

/**
 * DOMContentLoaded 就绪，在 css js loaded 之前，回调 domloaded
 *
 */
Page.prototype.domloaded = function () {};

/**
 * 设备就绪 同时 页面数据准备就绪，回调 allready
 *
 */
// Page.prototype.allready = function () {};


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
            // 如果页面在这之前已经done过了，就不继续编译
            $('[type="x-tmpl-mustache"]').each(function (index, node) {
                var tmpl = node.innerHTML;
                // 通通拿出来预编译一发
                view.getRenderer(tmpl);
            });
            window.pageLog.compileTemplateEnd = Date.now();
            dfd.resolve();
        });
    }

    dfd.done(function () {

        // 执行任务
        me.execute()
            .done(function () {

                if (!me.data && me.lang) {
                    me.data = {
                        lang: me.lang
                    };
                }

                // 页面逻辑
                me.enter();

                me.done();

                me.devicereadyEnter();

                dfd.resolve();
            })
            .fail(function () {
                // Do something
                // me.error();
                dfd.reject();
            });
    })
    .fail(function () {
        // Do something
        me.failed();
        dfd.reject();
    });

    me._data = getParams();
    dfd.resolve();

    return dfd;
};

// var timeId = null;
// 5s 后设备为就绪，则认为失败
// var timeout = 5000;
// 设备就绪同时等待数据返回

/**
 * 设备就绪
 */
Page.prototype.deviceListener = function () {
    var me = this;

    // clearTimeout(timeId);

    // timeId = setTimeout(function () {
    //     document.removeEventListener('deviceready', readyFn);
    //     me.failed({code: 2, msg: 'deviceready timeout'});
    //     dfd.reject();
    // }, timeout);

    // -------------------------------------
    // 这里不适用于所有环境，此处为 cordova 服务
    // 等待 deviceready 完成
    // -------------------------------------
    window.pageLog.devicereadyStart = +new Date();
    document.addEventListener('deviceready', function () {
        window.isDeviceready = true;
        window.pageLog.devicereadyEnd = +new Date();
        me.devicereadyEnter();
    }, false);
};

/**
 * DOMContentLoaded 就绪
 */
Page.prototype.domContentListener = function () {
    var me = this;

    // -------------------------------------
    // 这里不适用于所有环境，此处为 cordova 服务
    // 等待 DOMContentLoaded 完成
    // -------------------------------------
    document.addEventListener('DOMContentLoaded', function () {
        me.domloaded();
    }, false);
};

/**
 * 设备准备完成的入口
 */
Page.prototype.devicereadyEnter = function () {
    // 虽然 deviceready 肯定比 enter 慢，但是为了避免意外，还是等待判断一下 是否 done
    if (this.isDone && window.isDeviceready) {
        this.deviceready();
        // 检查是否全部准备就绪
        // this.deviceAndDataListener();
    }
};

/**
 * Failed
 *
 * @param {Object} errObj, 错误信息
 */
Page.prototype.failed = function (errObj) {
    var me = this;

    var err = {
        code: 0,
        msg: 'failed'
    };

    $.extend(err, errObj);

    me.isFailed = true;

    // 掉线不发送错误 log
    if (err.code !== 1) {
        /* eslint-disable */
        log.send({
            'da_src': 'err: ' + err.msg + ' url: ' + window.location.href
                + ' pageLog: ' + util.qs.stringify(window.pageLog),
            'da_act': 'error'
        });
        /* eslint-enable */
    }

    me.data = {
        lang: this.lang
    };

    // 页面失败逻辑
    me.error();
};

/**
 * 错误逻辑
 */
Page.prototype.error = function () {};

/**
 * Done
 */
Page.prototype.done = function () {
    this.isDone = true;

    log.init();
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
 * @param {string} options, see view.js
 * @return {string} html 字符串
 *
 */
Page.prototype.render = function (selector, data, options) {
    var str = view.render(selector, data, options);
    return str;
};

/**
 * 获取请求参数并可以根据需求改变参数
 *
 * @param {string} api, 数据
 * @param {Object} data, 数据
 * @param {Object} opts, ajaxSettings
 * @return {Object} 请求配置对象
 */
Page.prototype.getRequestConfig = function (api, data, opts) {

    var r = {
        url: config.API.host + config.API.prefix + api
    };

    // 默认情况都需要带给 网关 的参数
    var defParams = storage.getData(config.const.TASK_PARAMS);
    var reqData = defParams;
    // url 上的参数
    var urlData = [];

    // get 请求下，所有的 params 拼接到 url 上
    if (/get/i.test(opts.type)) {
        reqData = $.extend(defParams || {}, data);
    }
    else {
        r.data = JSON.stringify(data);
    }

    // 拼接参数
    for (var p in reqData) {
        if (reqData.hasOwnProperty(p)) {
            urlData.push(p + '=' + reqData[p]);
        }
    }

    if (urlData.length > 0) {
        r.url = r.url + '?' + urlData.join('&');
    }

    return r;
};

/**
 * GET 请求入口，调用 ajax
 *
 * @param {number} api api号
 * @param {Object} data 请求数据
 * @param {Object} options 选项
 *      @param {string} options.url 请求的host
 * @return {Deferred}
 */
Page.get = function (api, data, options) {
    return this.ajax(api, data, $.extend(options || {}, {type: 'GET'}));
};

/**
 * POST 请求入口，调用 ajax
 *
 * @param {number} api api号
 * @param {Object} data 请求数据
 * @param {Object} options 选项
 *      @param {string} options.url 请求的host
 * @return {Deferred}
 */
Page.post = function (api, data, options) {
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
Page.ajax = function (api, data, options) {
    var me = this;
    var dfd = new $.Deferred();
    var isNetwork = util.isNetwork();

    var opts = {
        type: 'POST',
        dataType: 'json'
    };

    $.extend(opts, options);

    // 没有网络的状态
    // 根据配置判断如何展示错误信息
    if (!isNetwork) {
        var err = {
            code: 1,
            msg: 'Offline'
        };

        if (/get/i.test(opts.type)) {
            me.failed(err);
        }

        dfd.reject(err);
        return dfd;
    }

    // 获取请求配置
    var reqConfig = me.getRequestConfig(api, data, opts);

    var ajaxSettings = {
        url: reqConfig.url,
        type: opts.type,
        dataType: opts.dataType,
        timeout: 5000,
        headers: {
            'campo-proxy-request': true,
            'x-spdy-bypass': true
        },
        contentType: 'application/json; charset=utf-8'
    };

    if (reqConfig.data) {
        ajaxSettings.data = reqConfig.data;
    }

    if (config.debug) {

        // 上面的2个 电脑端联调不能传递
        delete ajaxSettings.headers;

        // debug & 由 node 转发的时候 和后端联调跨域的情况下需要加如下配置
        if (!/^\/data/.test(config.API.prefix)) {
            ajaxSettings.xhrFields = {
                withCredentials: true
            };

            ajaxSettings.headers = {
                'set-cookie': config.mock.token
            };
        }

        if (!/post/i.test(ajaxSettings.type)) {
            delete ajaxSettings.contentType;
        }

        // if (config.debug) {
            // console.log(cookies.get('JINSESSIONID'));
            // cookies.set('JINSESSIONID', config.mock.token);
            // cookies.set('uid', reqData.uid);
            // cookies.set('cid', reqData.cid);
        // }
    }

    ajaxSettings.success = function (result) {

        // 将语言包数据添加到 this.data
        if (result && result.data) {
            result.data.lang = me.lang;
        }

        // Just debug test
        // 模拟网络延迟
        if (config.debug) {
            setTimeout(function () {
                dfd.resolve(result);
            }, 40);
        }
        else {
            dfd.resolve(result);
        }
    };

    ajaxSettings.error = function (err) {
        dfd.reject(err);
    };

    /* eslint-disable */
    console.info(ajaxSettings);
    /* eslint-enable */

    // 这里实际会经过 mbreq.js 重写
    $.ajax(ajaxSettings);

    return dfd;
};

Page.prototype.ajax = Page.ajax;
Page.prototype.post = Page.post;
Page.prototype.get = Page.get;

module.exports = Page;
