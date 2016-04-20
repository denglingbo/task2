/**
 * @file initChooseScroll.js
 * @author hefeng
 *
 * 初始化选择控件滚动
 *
 */

var IScroll = require('dep/iscroll');

/**
 * 初始化滚动
 *
 * @param {Object} ele, 控件元素
 * @param {Object} slidePage, 滚动 slidePage页 的配置
 *
 */

function InitChooseScroll (slidePage) {
	var me = this;
	me.liHeight = slidePage.liHeight;
	me._scroll = new IScroll(slidePage.selector, {
		probeType: 2,
	    scrollX: false,
	    scrollY: true,
	    scrollbars: false,
	    mouseWheel: true,
	    startY: -me.liHeight
	});
}

InitChooseScroll.prototype = {

	/**
     * Destroy
     *
     */
    _destroy: function () {

        if (this._scroll) {
            this._scroll.destroy();
            this._scroll = null;
        }
    },

	/**
     * 绑定事件
     *
     */
	_bindEvents: function () {
		var me = this;
		me.myScroll.on('scroll', function () {

		});
	}
};
module.exports = InitChooseScroll;
