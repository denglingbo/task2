{{#objList}}
<div class="list-item" data-id={{ id }} data-pagenum="{{ pagenum }}" data-log='{"actionTag":"taskListEnterDetail"}'>

    {{#isRemindUpdate}}
    <div class="icon icon-point"></div>
    {{/isRemindUpdate}}

    {{#delayFlag}}
    <div class="icon icon-delay"><em>{{ lang.iconDelay }}</em></div>
    {{/delayFlag}}

    {{#isRemindNew}}
    <div class="icon icon-new"><em>{{ lang.iconNew }}</em></div>
    {{/isRemindNew}}

    <div class="list-item-title">
        <span class="list-item-title-text">{{ title }}</span>
        <span class="list-item-status status">{{ statusRaw }}</span>
    </div>

    <div class="list-item-content">
        <div class="list-item-content-name">
            <span>{{ lang.principal }}：</span><span class="principal-name" loader="{#list.id:{{ principalUser }}}{name}{/list.id}"></span>
        </div>
        <div class="">{{ doneTimeRaw }} {{ importanceRaw }}</div>
        <div class="time">{{ lang.updateDate }} {{ updateDateRaw }}</div>
        <!-- <div class="star"><em></em></div> -->
    </div>
</div>
{{/objList}}