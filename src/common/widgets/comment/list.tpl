<dl class="layout-list comments">
    <dt class="sub-title">{{ lang.commentTitle }}</dt>

    {{#obj_list}}
    {{> msg}}
    {{/obj_list}}

    {{^obj_list}}
    <dd class="list-null">
    {{ lang.commentNotFound }}
    </dd>
    {{/obj_list}}
</dl>