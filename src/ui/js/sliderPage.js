
/**
 * @file sliderPage.js
 * @author deo
 *
 * 滑动切换页面
 * @param {Ojbect} options,
 *
 */
var SliderPage = function (options) {

    if (!options) {
        console.warn('sliderPage.js options not array.');
        return;
    }

    this.opts = {

        selector: null,

        pages: [],

        class: {
            default: 'slide-default',
            defaultLeft: 'slide-default-left',
            defaultRight: 'slide-default-right',
            next: 'slide-next',
            prev: 'slide-prev',
            current: 'slide-current'
        },

        onStart: function () {},
        onSlide: function () {}
    };

    $.extend(this.opts, options);

    this.$items = $(this.opts.selector);
    this.$pages = $('.slider-page');

    // 获取第一个
    var obj = this.get();
    this.opts.onStart.call(this, obj);

    this.init();
};

SliderPage.prototype = {

    /**
     * 初始化
     *
     */
    init: function () {

        var me = this;
        var maxHeight = 0;

        this.$pages.each(function (i) {
            var $cur = $(this);
            // var hei = $cur.height();

            // if (hei > maxHeight) {
            //     maxHeight = hei;
            // }

            // $cur.css({
            //     'position': 'absolute',
            //     'height': hei
            // });

            if (i === 0) {
                $cur.addClass(me.opts.class.default);
            }
            else {
                $cur.addClass(me.opts.class.defaultRight);
            }
        });

        // this.$pages.parent().css({
        //     'height': maxHeight
        // });

        this.bindEvents();
    },

    /**
     * 获取当前或指定name 的配置项
     * @param {string|undefined} name, 可传递项，不传则返回‘当前’对象
     *
     */
    get: function (name) {

        var obj = null;

        this.opts.pages.forEach(function (item) {

            if (name !== undefined) {

                if (item.name === name) {
                    obj = item;
                }
            }

            else {

                if (item.current) {
                    obj = item;
                }
            }
        });

        return obj;
    },

    /**
     * 设置点击项以及位移项
     * @param {Object} before, 当前展示的对象
     * @param {Object} clicked, 点击项，执行位移的对象
     *
     */
    set: function (before, clicked) {
        before.current = false;
        clicked.current = true;
    },

    /**
     * 绑定事件
     *
     */
    bindEvents: function () {
        var me = this;

        this.$items.on('click', function () {
            me.switch.call(me, event.target);
        });
    },

    /**
     * 保持步长始终为 < 1 * step
     * @param {number} index, 
     *
     */
    // fixIndex: function (index) {
    //     return index > 1 ? 1 : index;
    // },

    /**
     * 为了保持位移始终在一个 view 的距离
     * @param {Object} before, 
     * @param {Object} clicked, options
     *
     */
    // getStep: function (before, clicked) {

    //     var step = 0;

    //     if (clicked && before.index < clicked.index) {
    //         step = this.fixIndex(clicked.index) * -1;
    //     }
    //     else {
    //         step = this.fixIndex(before.index);
    //     }

    //     return step * 100;
    // },

    /**
     * 获取动画样式
     * @param {Object} before, options
     * @param {Object} clicked, options
     *
     */
    getClass: function (before, clicked) {

        if (clicked && before.index < clicked.index) {
            return this.opts.class.next;
        }
        
        return this.opts.class.prev;
    },

    /**
     * 为了保证从右往左测点击，滑入的页面能从左侧进入，所以需要修正一下
     * !! 在从左往右切换跳过了中间页面直接点击到后面的页面再切换到左侧会出现滑入位置错误
     * @param {Object} $clicked,
     * @param {string} class,
     *
     */
    fix: function ($clicked, myClass) {

        $clicked
            .removeClass(this.opts.class.next)
            .removeClass(this.opts.class.prev)
            .removeClass(this.opts.class.defaultRight)
            .removeClass(this.opts.class.defaultLeft)
            .addClass(myClass)

        // 触发浏览器重绘
        // 写在需要重绘的代码后面
        // var offset = document.body.offsetHeight;
        $('body').height();
    },

    /**
     * 切换页面
     * @param {Element} target, Element target
     *
     */
    switch: function (target) {
        // 切换之前的配置
        var before = this.get();
        var $before = $(before.selector);

        var name = $(target).data('name');
        var clicked = this.get(name);
        var $clicked = $(clicked.selector);

        if (before.name === clicked.name) {
            return;
        }

        this.opts.onSlide.call(this, clicked);

        // 从右往左 fix
        if (before.index > clicked.index) {
            this.fix($clicked, this.opts.class.defaultLeft);
        }
        else {
            this.fix($clicked, this.opts.class.defaultRight);
        }

        var getClass = this.getClass(before, clicked);

        $before
            .removeClass(this.opts.class.current)
            .addClass(getClass);

        $clicked
            .addClass(this.opts.class.current);

        this.set(before, clicked);
    }
};

module.exports = SliderPage;