/**
 * @file virtualInput.js
 * @author deo
 *
 * 虚拟输入框
 * 将被废弃，暂用
 */

/**
 * 检查是否是 ios5一下的手机版本
 *
 * @return {boolean} 是否是ios5一下的手机版本
 */
function ltios4() {
    var isTrue = false;
    // 判断是否 iPhone 或者 iPod
    if (navigator.userAgent.match(/iPhone/i)) {
        isTrue = Boolean(navigator.userAgent.match(/OS [5-9]_\d[_\d]* like Mac OS X/i));
    }
    return isTrue;
}

var virtualInput = function (selector, options) {

    this.opts = {
        maxNum: 6000
    };

    $.extend(this.opts, options);

    this.$wrap = $(selector);
    this.$parent = $('#comment-input-wrapper');
    this.$shadow = $('#goalui-fixedinput-shadow');
    this.$placeholder = this.$wrap.find('.placeholder');
    this.$button = this.$wrap.find('.button');
    this.$send = this.$wrap.find('.send');
    this.$limit = this.$wrap.find('.limit');
    this.editor = '.editable';
    this.attachBtn = '#addAttach';
    this.attachList = '#attachList';
    this.isIOS4 = ltios4();
    this.winHeight = $(window).height();
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
            if (me.$send.data('attach')) {
                me.$send.removeClass('unable');
            }
            else {
                me.$send.addClass('unable');
            }
            me.$send.data({notNull: false});
        }
        else {
            me.$placeholder.addClass('hide');
            me.$send.data({notNull: true});
        }
    },

    reset: function () {
        var me = this;
        $(me.editor).html('');
        me.$wrap.removeClass('extend');
        me.$wrap.removeAttr('style');
        me.$placeholder.removeClass('hide');
        me.$shadow.addClass('hide');
        me.$limit.addClass('hide');
        me.$wrap.blur();
    },

    stopScroll: function () {

        // 解决弹出键盘后，遮罩被拖动导致输入位置移位
        $('#comment-input-wrapper').on('touchmove.virtual', function (event) {
            event.preventDefault();
            event.stopPropagation();
        });
        $('#goalui-fixedinput-shadow').on('touchmove.virtual', function (event) {
            event.preventDefault();
            event.stopPropagation();
        });
    },

    fixIOS4: function () {
        var me = this;
        var nowWinHeight = $(window).height();
        var height = me.winHeight - nowWinHeight;
        var boxHeight = me.$wrap.height();
        height += boxHeight;
        alert(height)
        if (me.isIOS4) {
            me.$wrap.css({marginTop: -height});
            // $(window).scrollTop(-height);
        }
    },

    bindEvents: function () {
        var me = this;
        // var $outter = $('#comment-input-wrapper');
        var $btnBox = $('#comment-input-wrapper .button-wrap');

        me.stopScroll();

        me.$wrap
            // 弹出输入框
            .on('click', me.editor, function (event) {
                event.preventDefault();
                event.stopPropagation();

                me.$shadow.removeClass('hide');
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
            })
            .on('focus', me.editor, function () {
                setTimeout(function () {
                    me.fixIOS4();
                }, 1000);
            });

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
            me.$wrap.removeAttr('style');
            $(me.attachList).addClass('hide');
        });

        $btnBox.on('click', function (e) {
            var target = e.target;
            if (target !== this) {
                return;
            }
            me.$shadow.addClass('hide');
            me.$wrap.removeClass('extend');
            me.$wrap.removeAttr('style');
            $(me.attachList).addClass('hide');
        });
    }
};

module.exports = virtualInput;
