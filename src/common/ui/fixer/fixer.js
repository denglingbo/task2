/**
 * @file asyncPager.js
 * @author deo
 *
 * 用于判断当前滚动时定位到的某元素
 */

require('./fixer.scss');

var Fixer = function (options) {

    // 该对象用于储存临界点的元素
    this.finder = {};

    this.opts = {
        // 一页多少条数据
        pageNum: 0,
        // 总共多少条数据
        total: 0,
        // data-pagenum, data-date
        finder: '',
        // 要去判断的元素集合
        elems: null,
        // 可视区域偏移量
        offset: 0,
        // 提示元素
        // default: function
        // selector|Element
        view: function () {
            return '<div class="fixer-tips"></div>';
        }
    };

    $.extend(this.opts, options);

    // 当前展示的
    this.curTop = null;

    this.boxTop = 0;

    // 最后一个元素的底部到顶的距离
    this.boxBottom = 0;

    // 第一个元素 top - 最后一个元素底部高度
    this.boxHeight = 0;

    // 总页数
    this.totalPage = Math.ceil(this.opts.total / this.opts.pageNum);

    this.$win = $(window);

    this.init();
};

Fixer.prototype = {

    init: function () {
        var me = this;

        if ($.isFunction(this.opts.view)) {
            $('body').append(this.opts.view());
            me.$view = $('.fixer-tips');
        }
        // 直接在指定的已经存在位置展示
        else {

        }

        me.bindEvents();
    },

    bindEvents: function () {
        var me = this;

        me.$win.on('scroll', function () {
            me.viewer();
        });
    },

    /**
     * viewer
     */
    viewer: function () {
        // 实际可视区域的临界点 y 坐标
        var top = this.$win.scrollTop() + this.$win.height() + this.opts.offset;
        var match = this.matcher(top);

        if (match !== null && this.curTop !== match.top) {

            this.$view.html(match.i + '/' + this.totalPage);

            this.curTop = match.top;
        }

        // 展示分页提示容器
        if (top > this.boxTop && top < this.boxBottom) {
            this.$view.addClass('fixer-show');
        }
        // 隐藏分页提示容器
        else {
            this.$view.removeClass('fixer-show');
            this.curTop = null;
        }
    },

    /**
     * 找出每个分页提示的临界元素
     * 保存最后一个元素，top 超过这个也不显示 view 提示
     */
    update: function () {
        var finder = {};
        var len;

        var $elems = $(this.opts.elems);

        // 如果有 pageNum 和 total，则只获取每个临界点的第一个元素
        if (this.opts.pageNum && this.opts.total) {
            len = $elems.length / this.opts.pageNum;
        }
        else {
            len = $elems.length;
        }

        // 储存作为判断的2个临界点
        for (var i = 0; i < len; i++) {
            var target = $elems[i * this.opts.pageNum];

            if (target) {
                var top = $(target).position().top;
                finder[top] = target;
            }
        }

        var last = $elems.last();

        this.boxTop = $elems.first().position().top;
        this.boxBottom = last.position().top + last.height();
        this.boxHeight = this.boxBottom - this.boxTop;

        this.finder = finder;

        this.viewer();
    },

    /**
     * 根据当前 top，判断在第几页
     *
     * @param {number} curTop, 当前的 top 值
     * @return {number} 当前页数, 0 代表不需要显示页数
     */
    matcher: function (curTop) {
        if (!curTop) {
            return null;
        }

        var i = 0;
        var obj = {};
        var temp = 0;

        for (var name in this.finder) {
            if (this.finder.hasOwnProperty(name)) {
                var top = name;

                // * 取最大的一个
                // * 达到临界点
                if (top < curTop && top > temp) {
                    obj = {
                        top: top,
                        target: this.finder[top],
                        i: ++i
                    };

                    temp = top;
                }
            }
        }

        return i === 0 ? null : obj;
    }
};

module.exports = Fixer;
