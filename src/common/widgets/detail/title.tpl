<div class="layout detail-title">
    {{^isTaskPage}}
    <div class="detail-title-control">
        <div class="detail-checkbox">
            <div class="tick untick"></div>
        </div>
    </div>
    {{/isTaskPage}}

    <div class="detail-title-main">
        <p class="detail-title-top">{{ title }}</p>
        <p data-log='{"da_src":"tick"}'>{{ updateDateRaw }}</p>
    </div>

    <div class="detail-title-right">
        {{#isTaskPage}}
        <p class="star"><em></em></p>
        {{/isTaskPage}}
        <p class="detail-title-state {{^isTaskPage}}detail-title-state-fixed{{/isTaskPage}} state-doing">{{ statusText }}</p>
    </div>
</div>