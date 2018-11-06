import registry from 'commons/registry';
import filter from './filter';

    export default function(list, data) {
        if (!data.dependencyproperties && !data.facets) {
            return list;
        }
        var dps = data.dependencyproperties ?
            data.dependencyproperties.split(",") : [];
        list.getEntries2 = list.getEntries;
        list.getEntries = function(page) {
            var es = registry.get("entrystore");
            var cache = es.getCache();

            var setFacets = () => {
                if (data.facets && typeof list.getFacets === 'function') {
                    const facets = {};
                    (list.getFacets() || []).forEach(function(f) {
                        facets[f.predicate] = f;
                    });
                    filter.facets2collections(facets);
                    registry.set("blocks_search_facets", facets);
                }
            };

            return this.getEntries2(page).then(function(arr) {
                var toLoad = {};
                arr.forEach(function(entry) {
                    var md = entry.getMetadata();
                    var s = entry.getResourceURI();
                    dps.forEach(function(dp) {
                        md.find(s, dp).forEach(function(stmt) {
                            if (stmt.getType() === "uri") {
                                if (cache.getByResourceURI(stmt.getValue()).length === 0) {
                                    toLoad[stmt.getValue()] = true;
                                }
                            }
                        })
                    });
                });
                var toLoadArr = Object.keys(toLoad);
                if (toLoadArr.length === 0) {
                    setFacets();
                    return arr;
                }
                return es.newSolrQuery().resource(toLoadArr).list().forEach(function() {
                    // Do nothing as we are happy with dependant entry to end up in cache
                }).then(function() {
                    setFacets();
                    return arr;
                })
            });
        };
        return list;
    };
