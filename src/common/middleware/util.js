/**
 * @file util.js
 * @author deo
 *
 * 移动组件包
 */

var util = {};

/**
 * 判断网络状态
 *
 * @return {boolean} 是否联网
 */
util.isNetwork = function () {
    var networkState = null;

    // 非手机环境不判断
    if (!navigator || !navigator.connection) {
        return true;
    }

    try {
        networkState = navigator.connection.type;
        /* eslint-disable */
        if (networkState === Connection.NONE) {
            return false;
        }
        else {
            return true;
        }
        /* eslint-enable */
    }
    catch (e) {
        // throw 'get navigator.connection.type failed!'
    }
};

module.exports = util;
