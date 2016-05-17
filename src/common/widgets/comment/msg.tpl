<dd id="user-{{ user_id }}" data-uid="{{ user_id }}" data-id="{{ id }}">
    <div class="column-left user-photo">
        <!-- <img src="base64" /> -->
    </div>
    <div class="column-middle">
        <div class="column-inner">
            <p class="columnu-title user-name">&nbsp;</p>
            <p class="columnu-date">{{ dataRaw }}</p>

            <div class="comments-main">
                {{&content}}
            </div>

            <div class="comments-button delete" data-id="{{ id }}" data-uid="{{ user_id }}">{{ lang.delete }}</div>

            <div class="comments-attach">
                <!-- By Attach js -->
            </div>
        </div>
    </div>
</dd>