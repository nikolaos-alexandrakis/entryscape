define([
    "exports",
    "config",
    "entryscape-commons/merge",
    "entryscape-commons/defaults",
    "../metadata/renderEntryMetadata",
    "../search/renderSearchList",
    "../search/renderSimpleSearch",
    "../search/renderMultiSearch",
    "../search/renderSearchFilter",
    "../search/renderClear",
    "../search/renderFacets",
    "../list/renderFormatList",
    "../list/renderCatalogList",
    "../list/renderList",
    "../text/renderEntryLink",
    "../text/renderEntryText",
    "../text/renderTemplate",
    "../text/renderCollectionText",
    "../image/renderImage",
    "../image/renderSlider",
    "../graphics/renderMap",
    "../graphics/renderChart",
    "../graphics/renderGraph",
    "./preload",
    "./error",
    "entryscape-commons/rdforms/linkBehaviourDialog"
], function(exports, config, merge, defaults, renderEntryMetadata, renderSearchList, renderSimpleSearch,
            renderMultiSearch, renderSearchFilter, renderClear, renderFacets, renderFormatList,
            renderCatalogList, renderList, renderEntryLink, renderEntryText, renderTemplate,
            renderCollectionText, renderImage, renderSlider, renderMap, renderChart, renderGraph, preload, error) {


    var block2function = {
        view: renderEntryMetadata,
        list: renderList,
        formatList: renderFormatList,
        catalogList: renderCatalogList,
        link: renderEntryLink,
        text: renderEntryText,
        template: renderTemplate,
        image: renderImage,
        slider: renderSlider,
        facets: renderFacets,
        simpleSearch: renderSimpleSearch,
        multiSearch: renderMultiSearch,
        searchList: renderSearchList,
        searchFilter: renderSearchFilter,
        clear: renderClear,
        collectionText: renderCollectionText,
        map: renderMap,
        chart: renderChart,
        graph: renderGraph,
        config: preload,
        viewMetadata: renderEntryMetadata, //deprecated, use view
        search: renderSearchList, //deprecated, use searchList
        preload: preload, //deprecated, use config
        helloworld: function(node, data, items) {node.innerHTML = data.message || 'Hello world!';},
    };

  (config.econfig.blocks || []).forEach((bc) => {
    if (bc.extends && block2function[bc.extends]) {
        block2function[bc.block] = function (node, data, items) {
            block2function[bc.extends](node, merge(bc, data), items);
        };
    } else if (bc.run) {
        block2function[bc.block] = bc.run;
    }
  });

    exports.list = Object.keys(block2function);
    exports.run = function(block, node, data) {
        defaults.get("itemstore", function(items) {
            if (data.error) {
                error(node, data, items);
            } else {
                var f = block2function[block || ""];
                if (f) {
                    f(node, data, items);
                }
            }
        });
    };

    exports.run('preload', null, config.econfig);

    config.nodes.forEach(function(nobj) {
        exports.run(nobj.data.block || nobj.data.component, nobj.node, nobj.data);
    });
    return exports;
});
