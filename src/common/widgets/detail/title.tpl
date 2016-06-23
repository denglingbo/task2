<div class="layout detail-title">
    {{^isTaskPage}}
    {{#taskDoing}}
    <div class="detail-title-control">
        <div class="detail-checkbox">
            <div class="tick {{#isDone}}ticked{{/isDone}}{{^isDone}}untick{{/isDone}}"></div>
        </div>
    </div>
    {{/taskDoing}}
    {{/isTaskPage}}

    <div class="detail-title-main {{^isTaskPage}}not-task-page{{/isTaskPage}}">
        <p class="detail-title-top word-content">{{ title }}</p>
        <p>{{ updateDateRaw }}</p>
    </div>

    <div class="detail-title-right">
        {{#isTaskPage}}
        <p class="star {{#attention}}follow{{/attention}}" data-log='{"actionTag":"taskDetailFollow"}'><em></em></p>
        {{/isTaskPage}}
        <p class="detail-title-state {{^isTaskPage}}detail-title-state-fixed{{/isTaskPage}}"
            data-status="{{ statusRaw }}"
        >{{ statusRaw }}</p>
    </div>
</div>