<div class="edit-title-wrap">
    <textarea id="edit-title" class="input" placeholder="请输入{{view.placeholder}}标题(必填)">{{title}}</textarea>
    <span class="err-tip"></span>
    <i class="close-x title-close hide"></i>
</div>

<div class="edit-content-wrap">
    <div class="edit-words">
        <textarea id="edit-content" class="input" placeholder="请输入{{view.placeholder}}描述(选填)">{{content}}</textarea>
        <span class="err-tip"></span>
        <i class="close-x words-close hide"></i>
    </div>
    <div class="edit-attach">
        <div class="edit-add-attach">
            <i class="add-attach"></i>
            <span>添加附件</span>
        </div>
        <div class="attach-list"></div>
    </div>
</div>

{{#view.task}}
<div class="edit-option">
    <div id="principal" class="edit-item"><span class='title'>负责人</span><span class="value">张三</span></div>
    <div id="attends" class="edit-item"><span class='title'>参与人</span><span class="value">水水</span></div>
</div>

<div class="edit-option">
    <div id="doneTime" class="edit-item"><span class='title'>完成时间</span><span class="value">尽快完成</span></div>
    <div id="urgencyBlock" class="edit-item"><span class='title'>紧要程度</span><span class="value">普通</span></div>
</div>
{{/view.task}}

{{#view.event}}
<div class="edit-option">
    <div id="urgencyBlock" class="edit-item"><span class='title'>紧要程度</span><span class="value">普通</span></div>
    <div id="affairType" class="edit-item"><span class='title'>事件类型</span><span class="value">待办</span></div>
</div>
{{/view.event}}

{{#view.discussion}}
<div class="edit-option">
    <div id="urgencyBlock" class="edit-item"><span class='title'>紧要程度</span><span class="value">普通</span></div>
    <div id="attends" class="edit-item"><span class='title'>参与人</span><span class="value">水水</span></div>
</div>
{{/view.discussion}}


<div id="alert-box">
    <div class="alert-length-limit hide"></div>
</div>