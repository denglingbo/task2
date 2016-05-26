{{#obj_list}}
<div class="list-item" data-id={{ id }} data-log='{"actionTag":"taskListEnterDetail"}'>
    <div class="list-item-title">
        <span class="list-item-title-text">{{ title }}</span>
        <span class="list-item-status status">{{ statusRaw }}</span>
    </div>

    <div class="list-item-content">
        <div class="">{{ lang.principal }}：{{ name }}</div>
        <div class="">{{ end_time }} [{{ importanceRaw }}]</div>
        <div class="time">{{ lang.updateDate }} {{ updateDateRaw }}</div>
        <!-- <div class="star"><em></em></div> -->
    </div>
</div>
{{/obj_list}}