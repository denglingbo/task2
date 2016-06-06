{{#objList}}
<dd id="item-{{ id }}" class="user-{{ userId }}" data-uid="{{ userId }}" data-id="{{ id }}">
    <div 
        class="column-left user-photo" 
        loader='<img src="{#list.id:{{ userId }}}{base64}{/list.id}" />'
    >
        <!-- <img src="base64" /> -->
    </div>
    <div class="column-middle">
        <div class="column-inner">
            <p class="columnu-title user-name" loader="{#list.id:{{ userId }}}{name}{/list.id}">&nbsp;</p>
            <p class="columnu-date">{{ dataRaw }}</p>

            <div class="comments-content">
                <div class="comments-content-inner">{{&content}}</div>
            </div>

            {{#isOwner}}
            <div class="comments-button delete" data-id="{{ id }}" data-uid="{{ userId }}">{{ lang.delete }}</div>
            {{/isOwner}}

            <div class="comments-attach">
                <!-- By Attach js -->
            </div>
        </div>
    </div>
</dd>
{{/objList}}