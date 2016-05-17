<dl class="layout-list comments">
    <dt class="sub-title">{{ lang.commentTitle }}</dt>

    {{#obj_list}}
    <dd id="user-{{ user_id }}" data-id="{{ user_id }}">
        <div class="column-left user-photo">
            <!-- <img src="base64" /> -->
        </div>
        <div class="column-middle">
            <div class="column-inner">
                <p class="columnu-title user-name"></p>
                <p class="columnu-date">{{ dataRaw }}</p>

                <div class="comments-main">
                    {{&content}}
                </div>

                <div class="comments-button delete" target-id="{{ user_id }}">{{ lang.delete }}</div>

                <div class="comments-attach">
                    <!-- By Attach js -->
                </div>
            </div>
        </div>
    </dd>
    {{/obj_list}}
</dl>