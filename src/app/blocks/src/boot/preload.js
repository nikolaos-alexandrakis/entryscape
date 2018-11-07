import config from 'config';
import params from 'blocks/boot/params';
import registry from 'commons/registry';

    const rdfutils = registry.get("rdfutils");
    const localize = registry.get("localize");
    const normalize = function(collection, group) {
        if (Array.isArray(collection)) {
            collection.forEach(function(c) {
                c.group = group;
            });
            return collection;
        }
        return Object.keys(collection).map(function(key) {
            return {
                label: collection[key],
                value: key,
                group: group
            }
        });
    };
    registry.set("blocks_named", {});
    registry.get("itemstore", function(itemstore) {
        var val2choice = {};
        itemstore.getItems().forEach(function(item) {
            if (item.getType() === "choice") {
                (item.getStaticChoices() || []).forEach(function(choice) {
                    val2choice[choice.value] = choice;
                });
            }
        });
        registry.set("itemstore_choices", val2choice);
    });
    export default function(node, data, items) {
      if (data.named) {
        registry.set("blocks_named", data.named);
      }
      let clicks = registry.get('clicks');
      if (!clicks) {
        clicks = {};
        registry.set('clicks', clicks);
      }
      if (data.clicks) {
        Object.assign(clicks, data.clicks);
      }
      if (data.collections) {
            params.onInit(function(urlParams) {
                data.collections.forEach(function(def) {
                    def.includeAsFacet = def.includeAsFacet !== false
                        && def.property != null;
                    if (def.list) {
                        def.type = 'inline';
                        def.source = normalize(def.list, def.name);
                        def.list = def.limit > 0 ?
                            def.source.slice(0, def.limit) : def.source;
                        registry.set("blocks_collection_"+def.name, def);
                    } else if (def.templatesource) {
                        def.type = 'rdforms';
                        const item = items.getItem(def.templatesource);
                        def.source = item.getStaticChoices().map((choice) => {
                            return {
                                label: localize(choice.label),
                                value: choice.value,
                                group: def.name
                            }
                        });
                        def.list = def.limit > 0 ?
                            def.source.slice(0, def.limit) : def.source;
                        registry.set("blocks_collection_"+def.name, def);
                    } else if (def.type === 'preload') {
                        def.changeLoadLimit = (limit) => {
                          def.loadedLimit = limit;
                          var es = registry.get("entrystore");
                          var qo = es.newSolrQuery().rdfType(def.rdftype).publicRead();
                          var contextId = def.context === true ? urlParams.context :
                            def.context;
                          if (contextId) {
                            qo.context(es.getContextById(contextId));
                          }
                          let p;
                          if (limit) {
                            p = qo.limit(limit).list().getEntries();
                          } else {
                            const entryArr = [];
                            p = qo.list().forEach((entry) => {
                              entryArr.push(entry);
                            }).then(() => {
                              return entryArr;
                            });
                          }
                          return p.then((entryArr) => {
                            const collection = [];
                            entryArr.forEach((entry) => {
                              collection.push({
                                entry: entry,
                                label: rdfutils.getLabel(entry),
                                value: entry.getResourceURI(),
                                group: def.name
                              });
                            });
                            def.source = collection;
                            def.list = collection;
                            registry.set("blocks_collection_"+def.name, def);
                          });
                        };
                      def.changeLoadLimit(def.limit);
                    } else {
                      registry.set("blocks_collection_"+def.name, def);
                    }
                });
                const collections = registry.get("blocks_collections") || [];
                registry.set("blocks_collections", collections.concat(data.collections));
            })
        }
    };
