{{#auditRemark}}
<!-- 审核理由，同意 不同意 的内容 -->
<div class="layout">
    <div class="sub-title">{{ lang.auditRemark }}</div>

    <div class="layout-section word-content rich-outter">
        <div class="rich-inner">
        {{& auditRemark }}
        </div>
    </div>
</div>
{{/auditRemark}}

{{#suspendRemark}}
<!-- 撤消理由 -->
<div class="layout">
    <div class="sub-title">{{ lang.revokeReason }}</div>

    <div class="layout-section word-content rich-outter">
        <div class="rich-inner">
        {{& suspendRemark }}
        </div>
    </div>
</div>
{{/suspendRemark}}

{{#isRefuse}}
{{#refuseReason}}
<!-- 拒绝理由 -->
<div class="layout">
    <div class="sub-title">{{ lang.refuseReason }}</div>

    <div class="layout-section word-content rich-outter">
        <div class="rich-inner">
        {{& refuseReason }}
        </div>
    </div>
</div>
{{/refuseReason}}
{{/isRefuse}}

{{#completeRemark}}
<!-- 申请理由 -->
<div class="layout">
    <div class="sub-title">{{ lang.reasonsTitle }}</div>

    <div class="layout-section word-content rich-outter">
        <div class="rich-inner">
        {{& completeRemark }}
        </div>
    </div>
</div>
{{/completeRemark}}

{{#summary}}
<!-- 总结 -->
<div class="layout">
    <div class="sub-title">{{ summaryTitleRaw }}</div>

    <div class="layout-section word-content rich-outter">
        <div class="rich-inner">
        {{& summary }}
        </div>
    </div>
    <!-- 附件 -->
    <div class="layout-list attach hide">
        <div class="sub-title">{{lang.attach}}</div>
        <div class="attach-container"></div>
    </div>
</div>
{{/summary}}

<!-- 描述 -->
<div class="layout detail-comments">
    <div class="sub-title">{{ describeTitleRaw }}</div>

    {{#content}}
    <div class="layout-section word-content rich-outter">
        <div class="rich-inner">
        {{& content }}
        </div>
    </div>
    {{/content}}

    <div class="layout-section">{{ lang.importance }}: {{ importanceRaw }}</div>
    {{#isTaskPage}}
    <div class="layout-section">{{ lang.doneTime }}: {{ doneTimeRaw }}</div>
    {{/isTaskPage}}
</div>