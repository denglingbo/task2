/**
 * @file localdb.js
 * @author deo
 *
 * 本地数据库，主要应用于 离线状态
 */
/* eslint-disable */

var md5 = require('dep/md5');
var util = require('common/util');
var localstorage = require('common/localstorage');

/**
 * local db 
 *
 * @param {string} dbName
 * @param {string} collectionName
 */
var localdb = function (dbName, collectionName) {

    // 当前浏览器支持的总大小
    this.max = 0; 

    /**
     * 当前总大小
     */
    this.total = JSON.stringify(localStorage).length;

    /**
     * @param {string} db name
     */
    this.dbName = dbName;

    /**
     * @param {string} collection name
     */
    this.collectionName = this.dbName + '.' + collectionName;

    /**
     * @param {Object} 表内容对象
     */
    this.collection = this.getCollection();

    // 如果没有自动创建
    if (this.collection === null) {
        localstorage.addData(this.collectionName, '');

        this.collection = this.getCollection();
    }

    // 文档 大小
    this.size = JSON.stringify(this.collection).length;

    return this;
};

localdb.prototype.getCollection = function () {
    return localstorage.getData(this.collectionName);
};

/**
 * 创建数据
 *
 * @param {Object} data, 数据
 * @param {Object} query, 查询条件
 * @return {Object} 新数据
 */
var createData = function (data, query) {

    return {
        // 查询条件
        query: query,

        // 数据
        data: data,

        // 使用次数
        _count: 1,

        // 更新时间
        _updateTime: null,

        // 创建时间
        _createTime: util.now()
    };
};

/**
 * 查找数据
 *
 * @param {Object} query, 查询条件
 * @return {Object|null} 数据
 */
localdb.prototype.find = function (query) {

    // 用 query 条件作为 db collectin key
    var cid = md5(JSON.stringify(query));

    // collections
    var colls = this.getCollection() || {};

    var col = colls[cid];
    
    if (col && col.data) {
        return col.data;
    }

    return null;
};

/**
 * 更新数据
 *
 * @param {Object} data, 数据
 * @param {Object} query, 查询条件
 */
localdb.prototype.update = function (data, query) {

    // 用 query 条件作为 db collectin key
    var cid = md5(JSON.stringify(query));

    // collection name
    var cname = this.collectionName;

    // collections
    var colls = this.getCollection() || {};

    // collection item
    var col = colls[cid];

    // 存在 文档集合，查找是否存在对应 文档
    if (colls && col) {
        col._count ++;
        col._updateTime = util.now();
    }

    // 没有该 文档集合 没有数据，则直接新增
    else {
        colls[cid] = createData(data, query);
    }

    localstorage.addData(cname, colls);
};

/**
 * 删除数据
 *
 * @param {Object} query, 查询条件
 */
localdb.prototype.remove = function (query) {

};

module.exports = localdb;
