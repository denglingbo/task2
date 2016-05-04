<div class="edit-title-wrap">
    <div class="title-wrap">
        <div id="edit-title" class="input" contenteditable="plaintext-only" data-placeholder="{{view.placeholderTitle}}">{{title}}</div>
    </div>
    <span class="err-tip"></span>
    <i class="close-x title-close hide"></i>
</div>

<div class="edit-content-wrap">
    <div class="edit-words">
        <div class="content-wrap">
           <div id="edit-content" class="input" contenteditable="plaintext-only" data-placeholder="{{view.placeholderContent}}">{{content}}</div> 
        </div>
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


<div id="alert-box">
    <div class="alert-length-limit hide"></div>
</div>
<button id='submit'>submit</button>
<button id='cancel'>cancel</button>