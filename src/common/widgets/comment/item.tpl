{{#objList}}
<dd id="item-{{ id }}" class="user-{{ userId }}" data-uid="{{ userId }}" data-id="{{ id }}">
    <div 
        class="column-left user-photo" 
        loader='<img src="data:image/png;base64,{#list.id:{{ userId }}}{base64}{/list.id}" />'
    >
        <!-- <img src="base64" /> -->
    </div>
    <div class="column-middle">
        <div class="column-inner">
            <p class="columnu-title user-name" loader="{#list.id:{{ userId }}}{name}{/list.id}">&nbsp;</p>
            <p class="columnu-date">{{ dataRaw }}</p>

            <div class="comments-content rich-outter">
                <div class="comments-content-inner rich-inner">{{&content}}</div>
            </div>

            <div class="comments-attach comments-attach-{{ id }}">
                <!-- By Attach js -->
            </div>

            {{#deleteRights}}
            <div class="comments-button {{^isDoing}}hide{{/isDoing}}" data-id="{{ id }}" data-uid="{{ userId }}"><span class="delete">{{ lang.delete }}</span></div>
            {{/deleteRights}}
        </div>
    </div>
</dd>
{{/objList}}