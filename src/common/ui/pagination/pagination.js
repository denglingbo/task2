/**
 * @file pagination.js
 * @author deo
 *
 * 用于判断当前滚动时定位到的某元素
 *
 * require pagination.scss
 *
 * 如果不使用默认的 view (.pagination-tips), 需要自己添加 view 的样式
 * 同时需要 对 js 自动添加的 .pagination-show 添加对应样式
 *
 EG 1:
    JS:
        var pagination = new Pagination({
            elems: '#id div',
            // data-pagenum，数据来源, 如果使用 template，该值可忽略
            finder: 'pagenum',
            pageNum: 10,
            // 可视偏移量
            offset: -44,
            total: data.total,
            // 在屏幕下方作为展示的基准点
            screen: 1
        });

        pagination.complete();

EG 2:
    DOM:
        <div id="tips">[数据来源为 {pagination.opts.template} return 的值]</div>

    JS:
        var pagination = new Pagination({
            elems: 'ul li',
            view: '#tips',
            template: function (match) {
                return 'tid: ' + $(match.target).attr('tid');
            }
        });

        pagination.complete();
 */
(function (window, document) {

    var Pagination = function (options) {

        // 该对象用于储存临界点的元素
        this.finder = {};

        this.opts = {
            // 如果有该值，分页提示容器会被添加到该容器下
            wrapper: null,

            // 判断的基准点
            // 0: 屏幕顶部，1: 屏幕底部
            screen: 0,
            // 用于判断的元素
            elems: null,
            // 用于获取数据，pagination 会从 dom 节点的 data-[name] 上获取数据: data-pagenum, data-date
            // 如果使用 template() 该值可忽略
            finder: '',
            // pageNum & total: 这两个用于 分页模型
            // 一页多少条数据
            pageNum: 0,
            // 总共多少条数据
            total: 0,
            // 可视区域偏移量
            offset: 0,

            // view 模版输出
            // @param {new Pagination} this, function 中返回的第一个参数是 pagination
            // @param {Object} match, 匹配到的当前的进入临界位置的配置
            template: function (match) {
                return $(match.target).data(this.opts.finder) + '/' + this.totalPage;
            },

            // 提示元素
            // {Function}, function () { return ''; }
            // {selector|Element}, '.class', '#id', div, $()
            view: function () {
                return '<div class="pagination-tips"></div>';
            }
        };

        $.extend(this.opts, options);

        // 当前展示的
        this.curTop = null;

        // 容器，顶部
        this.boxTop = 0;

        // 容器，最后一个元素的底部到顶的距离
        this.boxBottom = 0;

        // 总页数
        this.totalPage = Math.ceil(this.opts.total / this.opts.pageNum);

        this.$win = $(window);
        this.$wrapper = $(this.opts.wrapper);

        this.init();
    };

    Pagination.prototype = {

        // 用于匹配的对象的配置
        finder: {},

        init: function () {
            var me = this;

            // 默认会添加的 dom
            if ($.isFunction(this.opts.view)) {
                var $outter = me.opts.wrapper || $('body');
                var $view = me.opts.view();

                if (!$outter.find('pagination-tips').length) {
                    $outter.append($view);
                    me.$view = $outter.find('.pagination-tips');
                }
            }
            // 直接在指定的已经存在位置展示
            else {
                me.$view = $(this.opts.view);
            }

            var $elems = this.$wrapper.find(this.opts.elems);

            $elems.parent().css('position', 'relative');

            me.bindEvents();
        },

        bindEvents: function () {
            $(document).on('scroll', $.proxy(this.process, this));
            $(window).one('scroll', $.proxy(this.process, this));
        },

        /**
         * process 这里接收外面传递的 scroll top
         * 因使用了 scroll.js 无法通过 bindEvents 监听到 scroll
         *
         * @param {number} scrollTop, 可选 该值不传递则使用 window scrolltop
         */
        process: function (scrollTop) {

            // 实际可视区域的临界点 y 坐标
            var top = (scrollTop || this.$win.scrollTop()) + this.opts.offset;

            if (this.opts.screen === 1) {
                top = top + this.$win.height() * -1;
            }

            var match = this.matcher(top);

            // matched
            if (match !== null) {
                var str = this.opts.template.call(this, match);

                this.$view
                    .html(str)
                    .css('margin-left', this.$view.width() * -.5);

                this.curTop = match.top;
            }

            // 展示分页提示容器
            if (Math.abs(top) >= this.boxTop && top < this.boxBottom && match !== null) {
                this.$view.addClass('pagination-show');
            }
            // 隐藏分页提示容器
            else {
                this.$view.removeClass('pagination-show');
                this.curTop = null;
            }
        },

        /**
         * 找出每个分页提示的临界元素
         * 保存最后一个元素，top 超过这个也不显示 view 提示
         */
        complete: function () {
            var len;

            var $elems = this.$wrapper.find(this.opts.elems);

            // 如果有 pageNum 和 total，则只获取每个临界点的第一个元素
            if (this.opts.pageNum && this.opts.total) {
                len = Math.ceil($elems.length / this.opts.pageNum);
            }
            else {
                len = $elems.length;
            }

            // 储存作为判断的临界点
            for (var i = 0; i < len; i++) {
                var target;

                if (this.opts.pageNum) {
                    target = $elems[i * this.opts.pageNum];
                }
                else {
                    target = $elems[i];
                }

                if (target) {
                    var top = Math.abs(Math.floor($(target).position().top));
                    this.finder[top] = target;
                }
            }

            var last = $elems.last();

            this.boxTop = Math.abs($elems.first().position().top);
            this.boxBottom = Math.abs(last.position().top + last.height() + this.opts.offset);

            this.process();
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
                    var top = Math.abs(name);

                    // * 取最大的一个
                    // * 达到临界点
                    if (top < Math.abs(curTop) && top >= temp) {
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

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Pagination;
    }
    else if (typeof define === 'function' && define.amd) {
        define(function () {
            return Pagination;
        });
    }
    else {
        window.Pagination = Pagination;
    }

})(window, document);
