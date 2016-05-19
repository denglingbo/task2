<dl class="layout-list comments">
    <dt class="sub-title">{{ lang.commentTitle }}</dt>
    
    <dd class="list-null hide">
    {{ lang.commentNotFound }}
    </dd>

    {{#obj_list}}
    {{> msg}}
    {{/obj_list}}
</dl>