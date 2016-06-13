/**
 * @file touchButton.js
 * @author deo
 *
 * 解决 touch 提示的问题
 */

module.exports = function () {

    var $layout = $('body');
    var handler = '.touch-button';

    $layout.on('touchstart', handler, function () {
        var $touch = $(this);

        if (!this._opacity) {
            this._opacity = $touch.css('opacity') || 1;
        }

        $touch.css({
            opacity: .8
        });
    });

    $layout.on('touchend', handler, function () {
        $(this).css({
            opacity: this._opacity || 1
        });
    });

};
