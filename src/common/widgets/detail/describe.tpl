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

{{#suspend}}
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
{{/suspend}}

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
<!-- 总结-有内容&附件 -->
<div class="layout detail-summary">
    <div class="sub-title">{{ summaryTitleRaw }}</div>

    <div class="layout-section word-content rich-outter">
        <div class="rich-inner">
        {{& summary }}
        </div>
    </div>

    <!-- 附件 -->
    <div class="layout-list summary-attach hide">
        <div class="summary-attach-container"></div>
        <div class="hide load-more" data-type="summary-attachs">{{lang.moreSummaryAttach}}<i class="more-attach"></i></div>
    </div>
</div>
{{/summary}}

{{^summary}}
{{#isSummaryAttachs}}
<!-- 总结-仅有附件 -->
<div class="layout detail-summary detail-summary-onlyattach">
    <div class="sub-title">{{ summaryTitleRaw }}</div>
    <!-- 附件 -->
    <div class="layout-list summary-attach hide">
        <div class="summary-attach-container"></div>
        <div class="hide load-more" data-type="summary-attachs">{{lang.moreSummaryAttach}}<i class="more-attach"></i></div>
    </div>
</div>
{{/isSummaryAttachs}}
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

    <div class="layout-section importance-content"><em>{{ lang.importance }}:</em> {{ importanceRaw }}</div>
    {{#isTaskPage}}
    <div class="layout-section donetime-content"><em>{{ lang.doneTime }}:</em> {{ doneTimeRaw }}</div>
    {{/isTaskPage}}

    {{#taskTagName}}
    <!-- 事件类型 -->
    <div class="layout-section affair-tagname-content"><em>{{ lang.affairType }}:</em> {{ taskTagName }}</div>
    {{/taskTagName}}
</div>