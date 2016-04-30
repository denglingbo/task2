/**
 * @file virtualInput.js
 * @author deo
 *
 * 虚拟输入框
 *
 */
(function (window, document) {

var virtualInput = function (selector) {

    var $wrap = $(selector);
    var $shadow = $('#goalui-fixedinput-shadow');
    var $placeholder = $wrap.find('.placeholder');
    var $button = $wrap.find('.button');
    var $send = $wrap.find('.send');
    var $limit = $wrap.find('.limit');

    var maxNum = 50;

    var editor = '.editable';

    // 展示发送按钮
    var sendStatus = function (target) {

        var text = $.trim($(target).text());

        if (text.length) {
            $button.addClass('hide');
            $send.removeClass('hide');
        }
        else {
            $button.addClass('hide');
            $send.removeClass('hide');
        }
    };

    $wrap
        // 弹出输入框
        .on('click', editor, function (event) {
            event.preventDefault();
            event.stopPropagation();

            $shadow.removeClass('hide');
            $placeholder.addClass('hide');

            sendStatus(this);
        })
        // 输入
        .on('input', editor, function () {
            var text = $.trim($(this).text());
            sendStatus(this);

            if (text.length > maxNum) {
                var limitNum = maxNum - text.length;
                $limit.html(limitNum).removeClass('hide');
                $send.addClass('unable');
            }
            else {
                $limit.html('').addClass('hide');
                $send.removeClass('unable');
            }
        })
        // 关闭
        .on('blur', editor, function () {
            if (!$.trim($(this).text())) {
                $placeholder.removeClass('hide');
            }
        });

    // 点击遮罩关闭键盘
    $shadow.on('click', function () {
        $shadow.addClass('hide');
        $button.removeClass('hide');
        $send.addClass('hide');
        $wrap.blur();
    });
};

if (typeof module != 'undefined' && module.exports) {
    module.exports = virtualInput;
}
else if (typeof define == 'function' && define.amd) {
    define(function () {
        return virtualInput;
    });
}
else {
    window.virtualInput = virtualInput;
}

})(window, document);