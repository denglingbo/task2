/**
 * @file phoneInput.js
 * @author deo
 *
 * 模拟手机端输入框
 */

require('./phoneInput.scss');

/**
 * 模拟输入框
 *
 * @param {Ojbect} options, 配置项
 */
var PhoneInput = function (options) {
    var me = this;

    me.opts = {
        handler: '.phone-input',
        input: '.phone-input-main',

        limit: false,

        button: false,

        selector: {
            placeholder: '.phone-input-placeholder',
            limit: '.phone-input-limit'
        }
    };

    $.extend(me.opts, options);

    // 外层
    me.$main = $(me.opts.handler);

    // 实际输入框
    me.$input = me.$main.find(me.opts.input);

    me.init();
};

var controlItem = '.phone-input-item';

PhoneInput.prototype = {

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
            me.elems.$placeholder.removeClass('hide');
            me.elems.$limit.addClass('hide');
        }

        // 隐藏 placeholder
        if (isNotNull && !isOutLimit) {
            me.elems.$placeholder.addClass('hide');
        }

        // 超过字数限制
        if (isOutLimit) {
            me.elems.$limit
                .html(me.outStringNum())
                .removeClass('hide');

            me.$main.attr('status', 'unable');
        }
        else {
            me.elems.$limit
                .html(me.outStringNum())
                .addClass('hide');

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
                    me.elems.$placeholder.addClass('hide');
                }
            })

            // 输入状态
            .on('input', function (event) {
                me.inputStatusChange();
            })

            // 关闭
            .on('blur', function () {
                if (me.isNull()) {
                    me.elems.$placeholder.removeClass('hide');
                }
            });
    },

    /**
     * 判断当前的输入框是否能提交
     *
     * @return {string}
     */
    isAllowSubmit: function () {
        var status = this.$main.attr('status');
        return status === 'unable' ? 0 : 1;
    }
};

module.exports = PhoneInput;
