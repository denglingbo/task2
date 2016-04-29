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
        <div id="addAttach" class="edit-add-attach">
            <i class="add-attach"></i>
            <span>添加附件</span>
        </div>
        <div id="attachList" class="attach-list"></div>
    </div>
</div>

{{#view.task}}
<div class="edit-option">
    <div id="principal" class="edit-item">
        <span class='title'>负责人</span>
        <div class="right">
            <span class="value">张三</span>
            <i class="arrow-right"></i>
        </div>
    </div>
    <div id="attends" class="edit-item">
        <span class='title'>参与人</span>
        <div class="right">
            <span class="value">水水</span>
            <i class="arrow-right"></i>
        </div>
    </div>
</div>

<div class="edit-option">
    <div id="doneTime" class="edit-item">
        <span class='title'>完成时间</span>
        <div class="right">
            <span class="value">尽快完成</span>
            <i class="arrow-right"></i>
        </div>
    </div>
    <div id="urgencyBlock" class="edit-item">
        <span class='title'>紧要程度</span>
        <div class="right">
            <span class="value">普通</span>
            <i class="arrow-right"></i>
        </div>
    </div>
</div>
{{/view.task}}

{{#view.affair}}
<div class="edit-option">
    <div id="urgencyBlock" class="edit-item">
        <span class='title'>紧要程度</span>
        <div class="right">
            <span class="value">普通</span>
            <i class="arrow-right"></i>
        </div>
    </div>
    <div id="affairType" class="edit-item">
        <span class='title'>事件类型</span>
        <div class="right">
            <span class="value">待办</span>
            <i class="arrow-right"></i>
        </div>
    </div>
</div>
{{/view.affair}}

{{#view.talk}}
<div class="edit-option">
    <div id="urgencyBlock" class="edit-item">
        <span class='title'>紧要程度</span>
        <div class="right">
            <span class="value">普通</span>
        </div>
    </div>
    <div id="attends" class="edit-item">
        <span class='title'>参与人</span>
        <div class="right">
            <span class="value">水水</span>
        </div>
    </div>
</div>
{{/view.talk}}


<div id="alert-box">
    <div class="alert-length-limit hide"></div>
</div>
<button id='submit'>submit</button>
<button id='cancel'>cancel</button>