/**
 * @file api.js
 * @author deo
 * Mock
 *
 */

module.exports = [
    {
        params: {
            id: 1000
        },
        response: './1000.json'
    },
    {
        params: {
            id: 1001
        },
        response: './1001.json'
    },
    {
        params: {
            id: 1002
        },
        response: './1002.json'
    },
    {
        params: {
            id: 1003
        },
        response: './1003.json'
    },

    {
        params: {
            id: 1004,
            page: 0
        },
        response: './1004/0.json'
    },
    {
        params: {
            id: 1004,
            page: 1
        },
        response: './1004/1.json'
    //编辑任务页
    {
        params: {
            id: 2000
        },
        response: './2000.json'
    }
];