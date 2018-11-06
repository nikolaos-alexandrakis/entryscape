import registry from 'commons/registry';
import params from 'blocks/boot/params';
import namespaces from 'rdfjson/namespaces';
import labels from './labels';

  const shorten = (value) => {
    if (value.length > 15) {
      const hidx = value.lastIndexOf('#');
      const sidx = value.lastIndexOf('/');
      return hidx > sidx ? value.substr(hidx + 1) : value.substr(sidx + 1);
    }
    return value;
  };

  const add = function (filter, option) {
    const group = option.group || 'term';
    let arr = filter[group];
    if (!arr) {
      arr = [];
      filter[group] = arr;
    }
    if (!arr.find(item => item.value === option.value)) {
      arr.push(option);
    }
  };

  const maybeResets = function(filter, group) {
    const collection = registry.get('blocks_collection_' + group);
    if (collection && collection.resets) {
      delete filter[collection.resets];
    }
  };

  let lock = false;
    // Timeout for unlock since hash change is detected via polling (dojo/hash)
    // and has a delay of 100 ms
  const unlock = function () {
    setTimeout(() => {
      lock = false;
    }, 150);
  };
  const filterObj = {
    clear() {
      if (lock) {
        return;
      }
      lock = true;
      registry.set('blocks_search_filter', {});
      unlock();
    },
    setAll(options) {
      if (lock) {
        return;
      }
      lock = true;
      const filter = {};
      (options || []).forEach((option) => {
        add(filter, option);
      });
      registry.set('blocks_search_filter', filter);
      unlock();
    },
    addAll(options) {
      if (lock) {
        return;
      }
      lock = true;
      const filter = registry.get('blocks_search_filter') || {};
      (options || []).forEach((option) => {
        add(filter, option);
      });
      registry.set('blocks_search_filter', filter);
      unlock();
    },
    add(option) {
      if (lock) {
        return;
      }
      lock = true;
      const filter = registry.get('blocks_search_filter') || {};
      add(filter, option);
      maybeResets(filter, option.group || 'term');
      registry.set('blocks_search_filter', filter);
      unlock();
    },
    remove(option) {      
      filterObj.replace(option);
    },
    replace(oldOption, newOption) {
      if (lock) {
        return;
      }
      lock = true;
      const filter = registry.get('blocks_search_filter') || {};
      let group;
      if (oldOption) {
        group = oldOption.group || 'term';
        const arr = filter[group];
        if (arr) {
          arr.splice(arr.indexOf(oldOption), 1);
          if (arr.length === 0) {
            delete filter[group];
          }
        }
      }
      if (newOption) {
        group = newOption.group || 'term';
        add(filter, newOption);
      }
      maybeResets(filter, group || 'term');
      registry.set('blocks_search_filter', filter);
      unlock();
    },
    constraints(obj) {
      const filter = registry.get('blocks_search_filter') || {};
      const filterIdx = {};
      (registry.get('blocks_collections') || []).forEach((c) => {
        filterIdx[c.name] = c;
      });
      Object.keys(filter).forEach((key) => {
        const vals = filter[key].map((v) => {
          if (typeof v === 'string') {
            return v;
          }
          return v.value;
        });
        switch (key) {
          case 'tags':
            return;
          case 'term':
            vals.forEach((v) => {
              obj.or({
                title: v,
                description: v,
                'tag.literal': v,
              });
            });
            return;
          case 'type':
            obj.rdfType(vals);
            return;
          default:
        }
        const filterDef = filterIdx[key];
        const prop = filterDef.property;
        if (namespaces.expand(prop) === namespaces.expand('rdf:type')) {
          obj.rdfType(vals);
        } else if (filterDef.nodetype === 'literal') {
          obj.literalProperty(prop, vals);
        } else {
          obj.uriProperty(prop, vals);
        }
      });
      return obj;
    },
    has(collectionname, value) {
      let vals = (registry.get('blocks_search_filter') || {})[collectionname];
      if (vals) {
        if (value === undefined) {
          return true;
        }
        const collection = registry.get('blocks_collection_' + collectionname);
        vals = vals.map(v => (typeof v === 'string' ? v : v.value));
        return vals.some(v => (collection.nodetype === 'literal' ? value :
          v === namespaces.expand(value)));
      }
      return false;
    },
    guard(node, conditional) {
      if (conditional) {
        const depColName = conditional.split('==')[0];
        const depVal = conditional.split('==')[1];
        const update = () => {
          if (filterObj.has(depColName, depVal)) {
            node.style.display = '';
          } else {
            node.style.display = 'none';
          }
        };
        update();
        registry.onChange('blocks_search_filter', update);
      }
    },
    facets(obj) {
      const collections = registry.get('blocks_collections');
      collections.forEach((def) => {
        if (def.includeAsFacet) {
          switch (def.nodetype) {
            case 'integer':
              obj.integerFacet(def.property);
              break;
            case 'literal':
              obj.literalFacet(def.property);
              break;
            default:
              obj.uriFacet(def.property);
          }
        }
      });
    },
    facets2collections(facetIdx) {
      const collections = registry.get('blocks_collections');
      collections.forEach((def) => {
        const facet = facetIdx[namespaces.expand(def.property)];
        const group = def.name;
        if (facet) {
          def.changeLoadLimit = (limit) => {
            def.loadedLimit = limit;
            if (def.nodetype === 'literal') {
              def.source = facet.values.map(value => ({
                label: value.name,
                value: value.name,
                group,
                occurence: value.count,
              }));
              def.list = (limit && facet.values.length > limit) ?
                        def.source.slice(0, limit) : def.source;
              registry.set(`blocks_collection_${def.name}`, def);
            } else {
              let values = facet.values;
              if (limit && values.length > limit) {
                values = values.slice(0, limit);
              }
              const svalues = values.map(value => value.name);
              labels(svalues, def.nodetype).then((lbls) => {
                def.source = values.map(value => ({
                  label: lbls[value.name] || shorten(value.name),
                  value: value.name,
                  group,
                  occurence: value.count,
                }));
                def.list = def.source;
                def.list.searchFacets = true;
                registry.set(`blocks_collection_${def.name}`, def);
              });
            }
          };
          def.changeLoadLimit(def.limit);
        }
      });
    },
  };

  registry.onChange('blocks_collections', (collections) => {
    let addListener = true;
    params.addListener((urlParams) => {
      const constraints = [];
      collections.forEach((c) => {
        if (c.includeAsFacet !== false) {
          if (urlParams[c.name]) {
            let arr = urlParams[c.name];
            if (!Array.isArray(arr)) {
              arr = [arr];
            }
            arr.forEach((f) => {
              constraints.push({ group: c.name, value: namespaces.expand(f) });
            });
          }
        }
      });
      if (urlParams.term) {
        if (Array.isArray(urlParams.term)) {
          urlParams.term.forEach((t) => {
            constraints.push({ value: t, label: t, group: 'term' });
          });
        } else {
          constraints.push({
            value: urlParams.term,
            label: urlParams.term,
            group: 'term',
          });
        }
      }
      filterObj.setAll(constraints);
      if (addListener) {
        addListener = false;
        registry.onChange('blocks_search_filter', (filter) => {
          delete urlParams.term;
          collections.forEach((c) => {
            if (c.includeAsFacet !== false) {
              delete urlParams[c.name];
            }
          });
          Object.keys(filter).forEach((key) => {
            const vs = filter[key];
            urlParams[key] = vs.map(v => namespaces.shortenKnown(v.value));
          });
          params.setLocation('', urlParams);
        });
      }
    });
  }, true);

  export default filterObj;
