/**
 * @file asyncPager.js
 * @author deo
 *
 * 用于异步获取数据的展示当前页数的组件
 */

require('./asyncPager.scss');

var AsyncPageNum = function (options) {

    // 该对象用于储存临界点的元素
    this.finder = {};

    this.opts = {
        // 一页多少条数据
        pageNum: 0,
        // 总共多少条数据
        total: 0,
        // 要去判断的元素集合
        elems: null
    };

    $.extend(this.opts, options);

    // 总页数
    this.totalPage = this.opts.total / this.opts.pageNum;

    this.init();
};

AsyncPageNum.prototype = {

    init: function () {
        var me = this;
        var $win = $(window);

        $win.on('scroll', function (event) {
            var top = $win.scrollTop();

            var matchNum = me.matcher(top);

            if (matchNum > 0) {
                // console.log(matchNum);
            }
        });
    },

    /**
     * 找出每个分页提示的临界元素
     */
    update: function () {
        var finder = {};

        var $elems = $(this.opts.elems);
        var findLen = $elems.length / this.opts.pageNum;

        for (var i = 0; i < findLen; i++) {
            var target = $elems[i * this.opts.pageNum];
            var top = $(target).position().top;
            finder[top] = target;
        }

        this.finder = finder;
    },

    /**
     * 根据当前 top，判断在第几页
     *
     * @param {number} top, 当前的 top 值
     * @return {number} 当前页数, 0 代表不需要显示页数
     */
    matcher: function (top) {
        if (!top) {
            return 0;
        }

        var i = 0;

        for (var key in this.finder) {
            // 达到临界点
            if (top >= key) {
                i++;
            }
        }

        return i;
    }
};

module.exports = AsyncPageNum;
