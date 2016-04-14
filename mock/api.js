/**
 * @file api.js
 * @author deo
 * Mock
 *
 */

module.exports = [
    // 首页
    {
        params: {
            id: 1000
        },
        response: './1000.json'
    },

    // 任务列表页
    {
        params: {
            id: 1001
        },
        response: './1001.json'
    },

    // 任务列表页 加载更多
    {
        params: {
            id: 1002
        },
        response: './1002.json'
    }
];
