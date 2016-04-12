/**
 * @file sticky 组件
 * @author deo
 */

define(function (require) {

    var util = require('../../common/util');

    var isSupportSticky = util.featureTest('position', 'sticky');

    /**
     * 默认参数表
     * @type {Object}
     */
    var DEFAULT_OPTS = {
        target: null, // 需要fixed的元素
        top: 0, // 距离容器的位置
        zIndex: 100
    };

    function Sticky(opts) {
        opts = $.extend({}, DEFAULT_OPTS, opts || {});

        this.$target = $(opts.target);

        if (!this.$target.length) {
            /* eslint-disable no-console */
            console.warn('Sticky: 元素不存在');
            /* eslint-enable no-console */
            return;
        }

        this.zIndex = opts.zIndex;
        this.top = opts.top;
        this.$container = this.$target.parent();

        this.init();
    }

    Sticky.prototype = {
        init: function () {
            if (isSupportSticky) {
                this.$target.css({
                    position: '-webkit-sticky',
                    top: this.top + 'px',
                    zIndex: this.zIndex
                });
            }
            else {
                this.$placeholder = $('<div></div>');
                this.$placeholder.css({
                    width: this.$target.width(),
                    height: this.$target.height()
                });
                this.$target.wrapAll(this.$placeholder);
                this.oldCss = this.$target.css(['position', 'top', 'z-index']);
                this.newCss = {
                    position: 'fixed',
                    top: this.top + 'px',
                    zIndex: this.zIndex
                };
                this.$body = $(document.body);
                this.refresh();
                this.process();
                // 修改下，把scroll事件绑定到document上，否则在pc上监听不到滚动
                $(document).on('scroll', $.proxy(this.process, this));
                // window.scrollTo()第一次进来不会触发绑定在document上的scroll事件。。。
                $(window).one('scroll', $.proxy(this.process, this));
            }
        },

        refresh: function () {
            this.containerOffset = this.$container.offset();
            this.targetOffset = this.$placeholder.offset();
            this.clientHeight = this.$body.height();
        },

        process: function () {
            var containerOffset = this.containerOffset;
            var targetOffset = this.targetOffset;

            if (this.clientHeight !== this.$body.height()) {
                this.refresh();
            }

            if (window.scrollY > targetOffset.top - this.top
                && containerOffset.top - this.top + containerOffset.height - targetOffset.height > window.scrollY) {
                this.fixed();
            }
            else {
                this.unfixed();
            }
        },

        fixed: function () {
            if (!this.isFixed) {
                this.$target.css(this.newCss);
                this.isFixed = true;
            }
        },

        unfixed: function () {
            if (this.isFixed) {
                this.$target.css(this.oldCss);
                this.isFixed = false;
            }
        }
    };

    return Sticky;
});
