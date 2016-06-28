/**
 * @file touchButton.js
 * @author deo
 *
 * 解决 touch 提示的问题
 */

module.exports = function () {

    var $layout = $('body');
    var handler = '.touch-button';

    $layout.off('touchstart').on('touchstart', handler, function () {
        var $touch = $(this);
        var touchClass = $touch.data('touch');

        this._touch = touchClass || null;

        if (this._touch) {
            $touch.addClass(this._touch);
        }

        else {
            if (!this._opacity) {
                this._opacity = $touch.css('opacity') || 1;
            }

            $touch.css({
                opacity: .8
            });
        }
    });

    $layout.off('touchend').on('touchend', handler, function () {

        if (this._touch) {
            $(this).removeClass(this._touch);
        }
        else {
            $(this).css({
                opacity: this._opacity || 1
            });
        }
    });

};
