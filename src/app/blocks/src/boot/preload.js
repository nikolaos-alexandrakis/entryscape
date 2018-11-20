import params from 'blocks/boot/params';
import registry from 'commons/registry';

const normalize = (collection, group) => {
  if (Array.isArray(collection)) {
    collection.forEach((c) => {
      c.group = group;
    });
    return collection;
  }
  return Object.keys(collection).map(key => ({
    label: collection[key],
    value: key,
    group,
  }));
};

export default function (node, data, items) {
  const rdfutils = registry.get('rdfutils');
  const localize = registry.get('localize');

  registry.set('blocks_named', {});
  const itemstore = registry.get('itemstore');
  const val2choice = {};
  itemstore.getItems().forEach((item) => {
    if (item.getType() === 'choice') {
      (item.getStaticChoices() || []).forEach((choice) => {
        val2choice[choice.value] = choice;
      });
    }
  });
  registry.set('itemstore_choices', val2choice);

  if (data.named) {
    registry.set('blocks_named', data.named);
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
    params.onInit((urlParams) => {
      data.collections.forEach((def) => {
        def.includeAsFacet = def.includeAsFacet !== false
                        && def.property != null;
        if (def.list) {
          def.type = 'inline';
          def.source = normalize(def.list, def.name);
          def.list = def.limit > 0 ?
            def.source.slice(0, def.limit) : def.source;
          registry.set(`blocks_collection_${def.name}`, def);
        } else if (def.templatesource) {
          def.type = 'rdforms';
          const item = items.getItem(def.templatesource);
          def.source = item.getStaticChoices().map(choice => ({
            label: localize(choice.label),
            value: choice.value,
            group: def.name,
          }));
          def.list = def.limit > 0 ?
            def.source.slice(0, def.limit) : def.source;
          registry.set(`blocks_collection_${def.name}`, def);
        } else if (def.type === 'preload') {
          def.changeLoadLimit = (limit) => {
            def.loadedLimit = limit;
            const es = registry.get('entrystore');
            const qo = es.newSolrQuery().rdfType(def.rdftype).publicRead();
            const contextId = def.context === true ? urlParams.context :
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
              }).then(() => entryArr);
            }
            return p.then((entryArr) => {
              const collection = [];
              entryArr.forEach((entry) => {
                collection.push({
                  entry,
                  label: rdfutils.getLabel(entry),
                  value: entry.getResourceURI(),
                  group: def.name,
                });
              });
              def.source = collection;
              def.list = collection;
              registry.set(`blocks_collection_${def.name}`, def);
            });
          };
          def.changeLoadLimit(def.limit);
        } else {
          registry.set(`blocks_collection_${def.name}`, def);
        }
      });
      const collections = registry.get('blocks_collections') || [];
      registry.set('blocks_collections', collections.concat(data.collections));
    });
  }
}
