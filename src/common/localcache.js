/**
 * @file localcache.js
 * @author deo
 *
 * 本地缓存数据，用于需要使用该展示策略的页面
 * 1. 为了让用户更快的进入页面
 * 2. 如果有该策略的页面，即便网络错误，一样可以进入页面，使用上次成功的数据进行模版渲染
 */

var config = require('../config');
var util = require('./util');
var storage = require('./localstorage');

var LOCALKEY = config.const.TASK_CACHE;

if (!storage.getData(LOCALKEY)) {
    storage.addData(LOCALKEY, '');
}

var Localcache = function () {};

Localcache.prototype = {

    cache: {},

    /**
     * 初始化
     *
     * @param {string} pageName, 页面名
     * @param {Function} pageKeyFn, key 从什么位置获取数据
     */
    init: function (pageName, pageKeyFn) {

        if (this.cache[pageName] === undefined) {
            this.cache[pageName] = {};

            if (pageKeyFn) {
                this.cache[pageName] = {
                    fn: pageKeyFn
                };
            }
        }
    },

    /**
     * 判断是否需要缓存
     */
    isCache: function (pageName) {
        return this.cache[pageName] !== undefined;
    },

    /**
     * 获取 cache 数据
     */
    get: function (pageName) {
        if (pageName === undefined) {
            return this.cache;
        }

        return this.cache[pageName] || null;
    },

    /**
     * 储存到 cache 中
     */
    save: function (pageName, data) {
        var item = this.get(pageName);

        // 有一些页面不能仅用 pagename 作为取数据的位置
        var key;

        if (item.fn) {
            key = item.fn();
        }

        // if (key) {
        //     item.data[key] = data;
        // }
        // else {
        //     item.data = data;
        // }

        this.save2Local(pageName, key, data);
    },

    /**
     * 储存到 localstorage 中
     */
    save2Local: function (pageName, key, cacheData) {
        var data = storage.getData(LOCALKEY);

        var temp = {};

        if (data[pageName]) {

            var pageData = data[pageName];

            // 如果是带私有 key 的页面数据，则继续取子节点的数据进行更改
            if (key) {
                temp[pageName] = pageData || {};

                temp[pageName][key] = cacheData;
            }
            else {
                temp[pageName] = cacheData;
            }
        }

        storage.addData(LOCALKEY, temp);
    },

    /**
     * 从 localstorage 获取数据
     */
    getByLocal: function (pageName) {
        var data = storage.getData(LOCALKEY);

        var item = data[pageName];
        var cache = this.get(pageName);

        if (!cache) {
            return null;
        }

        if (cache.fn) {
            var key = cache.fn();

            return item[key];
        }

        return item;
    }
};

module.exports = new Localcache;
