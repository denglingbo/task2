{{#obj_list}}
<div class="list-item" data-log='{"actionTag":"taskListEnterDetail"}'>
    <div class="list-item-title">
        <span>{{ title }}</span>
        <span></span>
    </div>

    <div class="list-item-content">
        <div class="">{{ lang.principal }}：{{ name }}</div>
        <div class="">{{ end_time }} [{{ statusRaw }}]</div>
        <div class="time">{{ updateDateRaw }}</div>
        <!-- <div class="star"><em></em></div> -->
    </div>
</div>
{{/obj_list}}