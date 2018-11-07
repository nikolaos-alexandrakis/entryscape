import registry from 'commons/registry';
import filter from './filter';

export default function (list, data) {
  if (!data.dependencyproperties && !data.facets) {
    return list;
  }
  const dps = data.dependencyproperties ?
            data.dependencyproperties.split(',') : [];
  list.getEntries2 = list.getEntries;
  list.getEntries = function (page) {
    const es = registry.get('entrystore');
    const cache = es.getCache();

    const setFacets = () => {
      if (data.facets && typeof list.getFacets === 'function') {
        const facets = {};
        (list.getFacets() || []).forEach((f) => {
          facets[f.predicate] = f;
        });
        filter.facets2collections(facets);
        registry.set('blocks_search_facets', facets);
      }
    };

    return this.getEntries2(page).then((arr) => {
      const toLoad = {};
      arr.forEach((entry) => {
        const md = entry.getMetadata();
        const s = entry.getResourceURI();
        dps.forEach((dp) => {
          md.find(s, dp).forEach((stmt) => {
            if (stmt.getType() === 'uri') {
              if (cache.getByResourceURI(stmt.getValue()).length === 0) {
                toLoad[stmt.getValue()] = true;
              }
            }
          });
        });
      });
      const toLoadArr = Object.keys(toLoad);
      if (toLoadArr.length === 0) {
        setFacets();
        return arr;
      }
      return es.newSolrQuery()
        .resource(toLoadArr)
        .list()
        .forEach(() => {
        // Do nothing as we are happy with dependant entry to end up in cache
        })
        .then(() => {
          setFacets();
          return arr;
        });
    });
  };
  return list;
}
