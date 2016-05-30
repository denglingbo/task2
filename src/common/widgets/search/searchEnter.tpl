<div id="search-wrap" class="search-wrap{{^isSearchPage}} hide{{/isSearchPage}}">
    <div class="search-inner border">
        <div class="search-in search-input-wrap">
            <input id="search-input" class="search-input" type="text">
            <i class="icon-search"></i>
            <span class="search-tip">{{lang.search}}</span>
            <i class="close-x clear hide"></i>
        </div>
        <span class="cancel">{{lang.cancel}}</span>
    </div>
    {{^isSearchPage}}
    <div class="search-mask"></div>
    {{/isSearchPage}}
    <div class="search-page hide">
        <ul class="search-content"></ul>
    </div>
</div>