{{#refuseReason}}
<!-- 拒绝理由 -->
<div class="layout detail-comments">
    <div class="sub-title">{{ lang.refuseReason }}</div>

    <div class="layout-section word-content rich-outter">
        <div class="rich-inner">
        {{& refuseReason }}
        </div>
    </div>
</div>
{{/refuseReason}}

{{#completeRemark}}
<!-- 申请理由 -->
<div class="layout detail-comments">
    <div class="sub-title">{{ reasonsTitleRaw }}</div>

    <div class="layout-section word-content rich-outter">
        <div class="rich-inner">
        {{& completeRemark }}
        </div>
    </div>
</div>
{{/completeRemark}}

{{#summary}}
<!-- 总结 -->
<div class="layout detail-comments">
    <div class="sub-title">{{ lang.summaryTitle }}</div>

    <div class="layout-section word-content rich-outter">
        <div class="rich-inner">
        {{& summary }}
        </div>
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