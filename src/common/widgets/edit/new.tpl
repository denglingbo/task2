
<div class="title-wrap phone-input">
    <div id="edit-title" class="phone-input-main input" required="true" contenteditable="plaintext-only" data-placeholder="{{placeholderTitle}}">{{title}}</div>
</div>

<div class="edit-content-wrap">
    <div class="edit-words">
        <div class="content-wrap phone-input">
           <div id="edit-content" class="phone-input-main input rich-inner" contenteditable="plaintext-only" data-placeholder="{{placeholderContent}}">{{& content}}</div> 
        </div>
    </div>
    {{> attach}}
</div>
