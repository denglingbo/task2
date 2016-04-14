/**
 * @file pageSlider.js
 * @author deo
 *
 * 滑动切换页面
 * @param {Ojbect} options,
 *
 */

var PageSlider = function (options) {

    if (!options) {
        // console.warn('pageSlider.js options not array.');
        return;
    }

    this.opts = {
        // 最外层容器
        'outer': null,
        // tabs
        'tabs': null,
        // 滑动 num 值，开始切换并加载新页面
        'slideNum': 0.3,
        // 要切换的页面 配置 {Array}
        'pages': [],

        'class': {
            'default': 'slide-default',
            'defaultLeft': 'slide-default-left',
            'defaultRight': 'slide-default-right',
            'next': 'slide-next',
            'prev': 'slide-prev',
            'current': 'slide-current'
        },

        // 
        'onInit': function () {},
        'onSlideBefore': function () {}
    };

    $.extend(this.opts, options);

    this.$outer = $(this.opts.outer);
    this.$items = $(this.opts.tabs);
    this.$pages = $('.slider-page');

    // 获取第一个
    var obj = this.get();
    this.opts.onInit.call(this, obj);

    this.init();
};

PageSlider.prototype = {

    /**
     * 初始化
     *
     */
    'init': function () {

        var me = this;
        // var maxHeight = 0;

        me.winWidth = $(window).width();
        me.winHeight = $(window).height();
        me.slideStep = Math.floor(me.winWidth * me.opts.slideNum);

        this.$pages.each(function (i) {
            var num = i * 100;
            $(this).css({
                'width': me.winWidth,
                'height': me.winHeight,
                'transform': 'translate3d(' + num + '%, 0px, 0px)'
            });
        });

        this.bindEvents();
    },

    /**
     * 获取当前或指定name 的配置项
     *
     * @param {string|undefined} name, 可传递项，不传则返回‘当前’对象
     * @return {Object}
     *
     */
    'get': function (name) {

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
     * 通过索引值查找对象
     *
     * @param {number} index, 索引值
     *
     */
    'findByIndex': function (index) {
        var i = null;

        this.opts.pages.forEach(function (item) {

            if (index === item.index) {
                i = item;
            }
        });

        return i;
    },

    /**
     * 设置点击项以及位移项
     *
     * @param {Object} before, 当前展示的对象
     * @param {Object} clicked, 点击项，执行位移的对象
     *
     */
    'set': function (before, clicked) {
        before.current = false;
        clicked.current = true;
    },

    /**
     * 绑定事件
     *
     */
    'bindEvents': function () {
        var me = this;

        this.$items.on('click', function () {
            me.switch.call(me, event.target);
        });

        this.curX = 0;
        this.startX = 0;

        // this.$outer
        $(window)
            .on('touchstart', function (event) {

            event.preventDefault();
            console.log($(event.target))
            console.log($(event.target).is('.slider-page'))
            me.name = $(event.target).parents('.slider-page').data('name');
            me.startX = event.touches[0].clientX;

            me.$outer.removeClass('slide-fast');
        });

        // this.$outer
        $(window)
            .on('touchmove', function (event) {

            event.preventDefault();
            me.x = event.touches[0].clientX;
            me.diff = me.x - me.startX;

            // 正数表示往右，负数表示往左
            me.step = (me.diff / me.winWidth) * 100;

            var step = me.step + me.curX;

            me.$outer.css({
                'transform': 'translate3d(' + step + '%, 0px, 0px)'
            });
        });

        // this.$outer
        $(window)
            .on('touchend', function () {

            event.preventDefault();

            // 切换页面
            if (Math.abs(me.diff) > me.slideStep) {
                var index = me.getToIndex();
                console.log('go: ' + index)
                var obj = me.findByIndex(index);
                me.opts.onSlideBefore.call(me, obj);
                me.goTo(index);
            }
            // 返回当前页
            else {
                var index = me.get(me.name).index;
                me.goBack(index);
            }
        });
    },

    goBack: function (index) {
        var num = index * 100 * -1;
        this.$outer.css({
            'transform': 'translate3d(' + num + '%, 0px, 0px)'
        }); 

        this.$outer.addClass('slide-fast');
        this.curX = num;
        console.log('back: ', num)
    },

    goTo: function (index) {
        var num = index * 100 * -1;
        this.$outer.css({
            'transform': 'translate3d(' + num + '%, 0px, 0px)'
        }); 

        this.$outer.addClass('slide-fast');
        this.curX = num;
        console.log('go: ', num)
    },

    /**
     * 获取touchend 时候要切换的方向上的页面索引值
     *
     * @param {Object} before, options
     * @param {Object} clicked, options
     * @return {string} 样式名
     *
     */
    getToIndex: function () {
        var obj = this.get(this.name);
        
        // 移动到下一个索引位
        var to = this.step > 0 ? 
            // 往左
            obj.index - 1:
            // 往右
            obj.index + 1;
console.log('getToIndex: ', to, this.step)
        if (to < 0) {
            return 0;
        }
        else if (to > this.opts.pages.length - 1) {
            return this.opts.pages.length - 1;
        }

        return to;
    },

    /**
     * 获取动画样式
     *
     * @param {Object} before, options
     * @param {Object} clicked, options
     * @return {string} 样式名
     *
     */
    'getClass': function (before, clicked) {

        if (clicked && before.index < clicked.index) {
            return this.opts.class.next;
        }
        return this.opts.class.prev;
    },

    /**
     * 为了保证从右往左测点击，滑入的页面能从左侧进入，所以需要修正一下
     * !! 在从左往右切换跳过了中间页面直接点击到后面的页面再切换到左侧会出现滑入位置错误
     *
     * @param {Object} $clicked, 点击的dom 对象
     * @param {string} myClass, 添加的样式
     *
     */
    // 'fix': function ($clicked, myClass) {

    //     $clicked
    //         .removeClass(this.opts.class.next)
    //         .removeClass(this.opts.class.prev)
    //         // .removeClass(this.opts.class.defaultRight)
    //         // .removeClass(this.opts.class.defaultLeft)
    //         .addClass(myClass);

    //     // 触发浏览器重绘
    //     // 写在需要重绘的代码后面
    //     // var offset = document.body.offsetHeight;
    //     $('body').height();
    // },

    /**
     * 切换页面
     *
     * @param {Element} target, Element target
     *
     */
    'switch': function (target) {
        // 切换之前的配置
        var before = this.get();
        var $before = $(before.tabs);

        var name = $(target).data('name');
        var clicked = this.get(name);
        var $clicked = $(clicked.tabs);

        if (before.name === clicked.name) {
            return;
        }

        this.opts.onBefore.call(this, clicked, before);

        // 从右往左 fix
        // if (before.index > clicked.index) {
        //     this.fix($clicked, this.opts.class.defaultLeft);
        // }
        // else {
        //     this.fix($clicked, this.opts.class.defaultRight);
        // }

        var getClass = this.getClass(before, clicked);

        $before
            .removeClass(this.opts.class.current)
            .addClass(getClass);

        $clicked
            .addClass(this.opts.class.current);

        this.set(before, clicked);
    }

    /**
     * 保持步长始终为 < 1 * step
     *
     * @param {number} index, 索引值
     *
     */
    // fixIndex: function (index) {
    //     return index > 1 ? 1 : index;
    // },

    /**
     * 为了保持位移始终在一个 view 的距离
     *
     * @param {Object} before, 当前展示的
     * @param {Object} clicked, 点击的，将要展示的 options
     * @return {number} 步长
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
    // }
};

module.exports = PageSlider;
