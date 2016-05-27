/**
 * @file config.js
 * @author deo
 *
 * 页面配置
 * 注：
 *  1. 如果没有 index 则代表输出到 opened 容器
 *  2. 未完成，是 除了( 完成 && 取消) 2种类别的 主条件，未完成 status=0 由后端处理
 *
 *  api: config.API.GET_TASK_LIST 暂时不需要，如果添加到 对象子节点上，会被优先使用
 */
// var config = require('../../config');

var pages = {

    // 未完成
    opened: {
        index: 0,
        api: 'asdf',
        params: {
            status: 0
        }
    },

    // 完成
    done: {
        index: 1,
        params: {
            status: 6
        }
    },

    // 已撤消
    cancel: {
        index: 2,
        params: {
            status: 7
        }
    },

    // 进行中
    doing: {
        params: {
            status: 4
        }
    },

    // 待接收
    received: {
        params: {
            status: 1
        }
    },

    // 待审核
    review: {
        params: {
            status: 5
        }
    },

    // 已拒绝
    refuse: {
        params: {
            status: 3
        }
    },

    // 待分派
    assignment: {
        params: {
            status: 2
        }
    }
};

for (var key in pages) {

    if (pages.hasOwnProperty(key)) {
        var item = pages[key];

        item.name = key;
        item.selector = '#list-wrapper-' + key;
    }
}

module.exports = pages;
