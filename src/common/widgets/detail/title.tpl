<div class="layout detail-title">
    {{^isTaskPage}}
    {{#taskDoing}}
    {{#resumeOrCloseRights}}
    <div class="detail-title-control">
        <div class="detail-checkbox">   
            <div class="tick {{#isDone}}ticked{{/isDone}}{{^isDone}}untick{{/isDone}}"></div>
        </div>
    </div>
    {{/resumeOrCloseRights}}
    {{/taskDoing}}
    {{/isTaskPage}}

    <div class="detail-title-main 
        {{^isTaskPage}}{{#taskDoing}}{{#resumeOrCloseRights}}
        not-task-page
        {{/resumeOrCloseRights}}{{/taskDoing}}{{/isTaskPage}}
    ">
        <p class="detail-title-top word-content">{{ title }}</p>
        <p><span class="create-user"></span><span>{{ updateDateRaw }}</span></p>
    </div>

    <div class="detail-title-right">
        {{#isTaskPage}}
        <p class="star {{#attention}}follow{{/attention}}"><em></em></p>
        {{/isTaskPage}}
        <p class="detail-title-state {{^isTaskPage}}detail-title-state-fixed{{/isTaskPage}}"
            data-status="{{ statusRaw }}"
        >{{ statusRaw }}</p>
    </div>
</div>