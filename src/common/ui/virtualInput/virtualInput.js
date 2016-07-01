/**
 * @file virtualInput.js
 * @author deo
 *
 * 虚拟输入框
 * 将被废弃，暂用
 */
/* eslint-disable */
var virtualInput = function (selector, options) {
    var me = this;

    this.opts = {
        maxNum: 6000
    };

    $.extend(this.opts, options);

    this.$wrap = $(selector);
    this.$shadow = $('#goalui-fixedinput-shadow');
    this.$placeholder = this.$wrap.find('.placeholder');
    this.$button = this.$wrap.find('.button');
    this.$send = this.$wrap.find('.send');
    this.$limit = this.$wrap.find('.limit');
    // this.$cancel = this.$wrap.find('.cancel-text');
    // this.cancel = '.cancel-text';
    this.editor = '.editable';
    this.attachBtn = '#addAttach';
    this.attachList = '#attachList';
    this.bindEvents();
};

virtualInput.prototype = {

    sendStatus: function () {
        var me = this;
        var text = $.trim($(me.editor).text());

        if (text.length > me.opts.maxNum) {
            var limitNum = me.opts.maxNum - text.length;
            me.$limit.html(limitNum).removeClass('hide');
            me.$send.addClass('unable');
            me.$send.data({toLong: true});
        }
        else {
            me.$limit.html('').addClass('hide');
            me.$send.removeClass('unable');
            me.$send.data({toLong: false});
        }

        if (!text.length) {
            me.$placeholder.removeClass('hide');
            if (me.$send.data('attach')){
                me.$send.removeClass('unable');
            }
            else {
                me.$send.addClass('unable');
            }
            me.$send.data({notNull: false});
            // me.$send.addClass('no-words');
        }
        else {
            me.$placeholder.addClass('hide');
            me.$send.data({notNull: true});
            // me.$send.removeClass('no-words');
        }
    },

    reset: function () {
        var me = this;
        $(me.editor).html('');
        me.$wrap.removeClass('extend');
        me.$placeholder.removeClass('hide');
        me.$shadow.addClass('hide');
        me.$limit.addClass('hide');
        // me.$cancel.addClass('no-words');
        // me.$send.addClass('hide');
        me.$wrap.blur();
    },

    bindEvents: function () {
        var me = this;
        var $outter = $('#comment-input-wrapper');
        me.$wrap
            // 弹出输入框
            .on('click', me.editor, function (event) {
                event.preventDefault();
                event.stopPropagation();

                me.$shadow.removeClass('hide');
                // me.$placeholder.addClass('hide');
                me.$wrap.addClass('extend');
                $(me.attachList).removeClass('hide');
                me.sendStatus();
            })
            // 输入
            .on('input', me.editor, function () {
                me.sendStatus();
            })
            // 关闭
            .on('blur', me.editor, function () {
                if (!$.trim($(this).text())) {
                    me.$placeholder.removeClass('hide');
                }
            });
            // .on('click', me.cancel, function () {
            //     $(me.editor).html('');
            //     me.sendStatus();
            // });
        me.$wrap.on('click', me.attachBtn, function () {
            me.$shadow.removeClass('hide');
            me.$wrap.addClass('extend');
            $(me.attachList).removeClass('hide');
            me.sendStatus();
        });
        // 点击遮罩关闭键盘
        me.$shadow.on('click', function () {
            me.$shadow.addClass('hide');
            me.$wrap.removeClass('extend');
            $(me.attachList).addClass('hide');

            // me.$wrap.blur();
        });
    }
};

module.exports = virtualInput;
