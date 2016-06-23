/**
 * @file phoneInput.js
 * @author deo
 *
 * 模拟手机端输入框
 */
require('./phoneInput.scss');

var Control = require('common/control');

/**
 * 模拟输入框
 *
 * @param {Ojbect} options, 配置项
 */
var PhoneInput = function (options) {

    Control.call(this, options);

    var me = this;
    /* eslint-disable */
    me.opts = {
        handler: '.phone-input',
        input: '.phone-input-main',

        limit: false,

        button: false,

        delete: false,

        selector: {
            placeholder: '.phone-input-placeholder',
            limit: '.phone-input-limit',
            delete: '.phone-input-delete'
        }
    };
    /* eslint-enable */
    $.extend(me.opts, options);

    // 外层
    me.$main = $(me.opts.handler);

    // 实际输入框
    me.$input = me.$main.find(me.opts.input);

    me._isEdit = false;
    me._defval = me.$input.html();

    me.init();
};

var controlItem = '.phone-input-item';

$.extend(PhoneInput.prototype, Control.prototype);

$.extend(PhoneInput.prototype, {

    /**
     * 添加一些必须的dom 或者属性
     */
    init: function () {

        this.placeholder = this.$input.data('placeholder');
        this.name = this.$input.data('name');
        this.value = '';
        // 用于存放一些非必需的 elements
        this.elems = {};

        this.addDom();
        this.bindEvents();

        this.inputStatusChange();
        this.displayer('delete') && this.displayer('delete').hide();
    },

    /**
     * 根据配置项，获取 dom 节点
     *
     * @return {string}
     */
    getDom: function () {
        var domClass = {};
        var selector = this.opts.selector;
        for (var key in selector) {
            if (selector.hasOwnProperty(key)) {
                domClass[key] = selector[key].replace(/^\./, '');
            }
        }

        var itemClass = controlItem.replace(/^\./, '');

        var htmlStr = '';

        // DOM place holder
        if (this.placeholder) {
            htmlStr += '<div class="' + itemClass + ' ' + domClass.placeholder + '">' + this.placeholder + '</div>';
        }

        // DOM limit
        if (this.opts.limit) {
            htmlStr += '<div class="' + itemClass + ' ' + domClass.limit + '"></div>';
        }

        // DOM button wrapper
        if (this.opts.button) {
            htmlStr += '<div class="phone-input-buttons"></div>';
        }

        // DOM button wrapper
        if (this.opts.delete) {
            htmlStr += '<div class="phone-input-delete"></div>';
        }

        return htmlStr;
    },

    /**
     * 添加 dom
     */
    addDom: function () {
        var html = this.getDom();
        var selector = this.opts.selector;

        this.$main.append(html);

        for (var key in selector) {
            if (selector.hasOwnProperty(key)) {
                this.elems['$' + key] = this.$main.find(selector[key]);
            }
        }
    },

    /**
     * 输入框字符长度
     *
     * @return {number}
     */
    getLength: function () {
        return this.$input.text().length;
    },

    /**
     * 输入框字符长度为空
     *
     * @return {boolean}
     */
    isNull: function () {
        return this.getLength() <= 0;
    },

    /**
     * 输入框字符长度不为空
     *
     * @return {boolean}
     */
    isNotNull: function () {
        return this.getLength() > 0;
    },

    /**
     * 输入框字符长度不为空
     *
     * @return {boolean}
     */
    isOutLimit: function () {
        return this.getLength() > this.opts.limit;
    },

    /**
     * 超出限制的字符数
     *
     * @return {number}
     */
    outStringNum: function () {
        var num = this.opts.limit - this.getLength();
        return num >= 0 ? 0 : num;
    },

    /**
     * 输入状态的dom 状态变化
     */
    inputStatusChange: function () {
        var me = this;

        var isNull = me.isNull();
        var isNotNull = me.isNotNull();
        var isOutLimit = me.isOutLimit();

        if (isNull) {
            me.displayer('placeholder').show();
            me.displayer('limit').hide();
            me.displayer('delete') && me.displayer('delete').hide();
        }

        if (isNotNull) {
            me.displayer('delete') && me.displayer('delete').show();
            me.displayer('placeholder').hide();
        }

        // 隐藏 placeholder
        if (isNotNull && !isOutLimit) {
            me.displayer('placeholder').hide();
        }

        // 超过字数限制
        if (isOutLimit) {
            me.displayer('limit').show(me.outStringNum());
            me.$main.attr('status', 'unable');
        }
        else {
            me.displayer('limit').hide(me.outStringNum());
            me.$main.attr('status', 'enable');
        }
    },

    /**
     * events
     */
    bindEvents: function () {
        var me = this;

        me.$input
            .on('click', function () {
                event.preventDefault();
                event.stopPropagation();

                // 隐藏 placeholder
                if (me.isNotNull() && !me.isOutLimit()) {
                    me.displayer('placeholder').hide();
                }

                if (me.isNotNull()) {
                    me.displayer('delete').show();
                }
            })

            // 输入状态
            .on('input', function (event) {
                me.inputStatusChange();

                var curval = $(this).html();

                if (curval !== me._defval) {
                    me._isEdit = true;
                }
                else {
                    me._isEdit = false;
                }
            })

            // 关闭
            .on('blur', function () {
                if (me.isNull()) {
                    me.displayer('placeholder').show();
                }
                setTimeout(function () {
                    me.displayer('delete').hide();
                }, 100);
            });

        // 删除按钮
        me.elems.$delete
            .on('click', function (e) {

                me.$input.text('');

                if (me.$input.html() !== me._defval) {
                    me._isEdit = true;
                }
                else {
                    me._isEdit = false;
                }

                me.inputStatusChange();

                me.$input.triggerHandler('input');
            });
    },

    /**
     * 对各种元素进行展示逻辑
     *
     * @param {string} selectorKey, selector 对应的 key， 被绑定在 this.elems 节点上
     * @return {Object} 返回 show(), hide()
     */
    displayer: function (selectorKey) {
        var $elem = this.elems['$' + selectorKey];

        if (!$elem.length) {
            return {
                show: function () {},
                hide: function () {}
            };
        }

        return {

            /**
             * 展示元素
             *
             * @param {string|Function} html, html 字符串或者 function
             */
            show: function (html) {
                $elem.removeClass('hide');
                if (html) {
                    $elem.html(html);
                }
            },

            /**
             * 展示元素
             *
             * @param {string|Function} html, html 字符串或者 function
             */
            hide: function (html) {
                $elem.addClass('hide');
                if (html) {
                    $elem.html(html);
                }
            }
        };
    },

    /**
     * 判断当前的输入框是否能提交
     *
     * @return {string}
     */
    isAllowSubmit: function () {
        var status = this.$main.attr('status');
        return status === 'unable' ? 0 : 1;
    },

    /**
     * 判断当前的输入框是否编辑过
     *
     * @return {boolean}
     */
    isEdited: function () {
        return this._isEdit;
    }
});

module.exports = PhoneInput;
