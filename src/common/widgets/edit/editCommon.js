/**
 * @file new.js
 * @author hefeng
 * 新建、编辑任务、事件、讨论的公共API
 *
 */

/**
 * 验证不通过弹窗
 *
 * @param {Array} arr, 需要弹窗提示的提示语集合
 *
 */
exports.validAlert = function (arr) {
    var $alertDom = $('.alert-length-limit');
    var len = arr.length;
    var time = 0;
    if (len > 1) {
        $alertDom.text(arr[0]).removeClass('hide');
        time = 3000;
    }
    else if (len === 1) {
        $alertDom.text(arr[0]).removeClass('hide');
        time = 3000;
    }
    else {
        return;
    }
    setTimeout(function () {
        $alertDom.addClass('hide');
        arr.shift()
        exports.validAlert(arr);
    },
    time);
};

/**
 * 取消确认是否编辑过, 是否离开弹窗
 *
 * @param {Object} validObj, 验证信息对象
 *
 */
exports.cancelValidate = function (validObj) {
    if(validObj.isEdit) {
        var cancelButton = {
            title: '取消',
            callback: function () {

            }
        };

        var OKButton = {
            title: '确认',
            callback: function () {

            }
        };
        CPUtils.showAlertView('', '确认放弃当前添加的内容', cancelButton, OKButton);
    }
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
        var $textDom = $parentDom.find('.input');
        if ($textDom.val().length) {
            validObj.isEdit = true;
        }
        $textDom.val('');
        $parentDom.find('.err-tip').text('');
        $(this).addClass('hide');
        if ($parentDom.hasClass('edit-title-wrap')) {
            validObj.title = false;
        }
        else {
            validObj.content = true;
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
        validObj.isEdit = true;

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
        validObj.isEdit = true;

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

/**
 * 编辑页面初始化close按钮和提交验证
 *
 * @param {Object} validObj, 验证信息对象
 *
 */
exports.initTextClose = function (validObj) {
    $.each($('.input'), function (index, item) {
        var itemValue = $(item).val();
        var itemLen = itemValue.length;
        exports.toggleX($(item), itemValue);
        if (item.id.indexOf('title') && itemLen > 0 && itemLen <= 50) {
            validObj.title = true;
        }
        if (item.id.indexOf('content') && itemLen > 50000) {
            validObj.content = false;
        }
    });
};

/**
 * 提交前验证
 *
 * @param {Function} submitFn, 提交到后端的函数
 * @param {Object} validObj, 验证信息对象
 *
 */
exports.submitValid = function (submitFn, validObj) {
    var flag = validObj.title && validObj.content && validObj.isAttachesReady;
    var arr = [];
    if (flag) {
       submitFn(); 
    }
    else {
        if (!validObj.title) {
            if(!$('#edit-title').val()) {
                arr.push('标题不能为空');
            }
            else {
                arr.push('标题不能超过50字');
            }
        }

        if (!validObj.content) {
            arr.push('输入内容不能超过5万字');
        }

        if (!validObj.isAttachesReady) {
            arr.push('附件尚未传输完毕');
        }
    }
    exports.validAlert(arr);
};

module.exports = exports;
