/**
 * @file new.js
 * @author hefeng
 * 新建、编辑任务、事件、讨论的公共API
 *
 */

/**
 * 验证不通过弹窗
 *
 * @param {string} str, 验证不通过的提示语句
 *
 */
exports.validAlert = function (str) {
    var $alertDom = $('.alert-length-limit');
    $alertDom.text(str).removeClass('hide');

    setTimeout(function () {
        $alertDom.addClass('hide');
    },
    3000);
};

/**
 * 转换string驼峰
 *
 * @param {string} str, 需要转换的字符串
 *
 * @return {string} 转换后的驼峰命名
 */
exports.camelCase = function (str) {
    return str.replace(/_+(.)?/g, function (str, e) {
        return e ? e.toUpperCase() : '';
    });
};

/**
 * 附件传入data key转为 camelCase
 *
 * @param {Array} arr, 附件传入data.attachements
 *
 * @return {Array}, 属性转换成驼峰命名的对象的集合
 */
exports.transKey = function (arr) {
    var newArr = [];
    if ($.isArray(arr)) {
        newArr = arr;
    }
    else if (arr instanceof Object) {
        newArr.push(arr);
    }
    var outArr = [];
    var newObj = {};
    for (var i = 0, len = newArr.length; i < len; i++) {
        var item = newArr[i];
        newObj = {};
        for (var key in item) {
            if (item.hasOwnProperty(key)) {
                newObj[exports.camelCase(key)] = item[key];
            }
        }
        outArr.push(newObj)
    }
    return outArr;
};

/**
 * 切换关闭按钮的显示与隐藏
 *
 * @param {Object} textDom, 当前输入框dom对象
 * @param {number} textLength, 输入框内文字长度
 *
 */
exports.toggleX = function (textDom, textLength) {
    if (!textLength) {
        $(textDom).parent().find('.close-x').addClass('hide');
    }
    else {
        $(textDom).parent().find('.close-x').removeClass('hide');
    }
};

/**
 * bind 文本框的清除按钮
 *
 * @param {Object} validObj, 验证信息对象
 *
 */
exports.bindClear = function (validObj) {
    $('.close-x').on('click', function () {
        var $parentDom = $(this).parent();
        $parentDom.find('.input').val('');
        $parentDom.find('.err-tip').text('');
        $(this).addClass('hide');
        if ($parentDom.hasClass('edit-title-wrap')) {
            validObj.title = false;
        }
    });
};

/**
 * bind title文本框的事件
 *
 * @param {Object} validObj, 验证信息对象
 *
 */
exports.bindTitle = function (validObj) {
    $('#edit-title').on('input propertychange', function () {
        var me = this;
        var length = $(me).val().length;
        var errTip = $(me).next('.err-tip');

        exports.toggleX(me, length);

        if (!length || length > 50) {
            validObj.title = false;
        }
        else {
            validObj.title = true;
        }

        if (length > 50) {
            errTip.text(50 - length);
        }
        else {
            errTip.text('');
        }
    });
};

/**
 * bind content文本框的事件
 *
 * @param {Object} validObj, 验证信息对象
 *
 */
exports.bindContent = function (validObj) {
    $('#edit-content').on('input propertychange', function () {
        var me = this;
        var length = $(me).val().length;
        var errTip = $(me).next('.err-tip');

        exports.toggleX(me, length);

        if (length > 50000) {
            validObj.content = false;
            errTip.text(50000 - length);
        }
        else {
            validObj.content = true;
            errTip.text('');
        }
    });
};

/**
 * bind 文本框获得焦点事件
 *
 */
exports.bindGetFocus = function () {
    $('.edit-title-wrap').on('click', function () {
        $('#edit-title').focus();
    });

    $('.edit-words').on('click', function () {
        $('#edit-content').focus();
    });
};

module.exports = exports;
