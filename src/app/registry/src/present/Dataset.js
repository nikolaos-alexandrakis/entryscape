import Dataset from 'catalog/public/Dataset';
import registry from 'commons/registry';
import declare from 'dojo/_base/declare';

export default declare([Dataset], {
  inDialog: true,
  graph: null,

  postCreate() {
    this.inherited('postCreate', arguments);
    this.distributionInfoDialog.checkForAPI = false;

    /**
     * @todo improve explanation
     * Because the entry/context template information is lost at this point given that we harvested the data
     * we fake  the existence of a contextEntry entry "__temporary" (by putting it in the es.js cache)
     * in order for the Lookup.template not to fail
     */
    const es = registry.getEntryStore();
    const cache = es.getCache();
    let __temporaryContextEntry = cache.get(es.getEntryURI('_contexts', '__temporary'));
    if (__temporaryContextEntry == null) {
      __temporaryContextEntry = es.newContext('__temporary', '__temporary');
      cache.cache(__temporaryContextEntry, true);
    }
  },
  /**
   *
   * @param datasetEntry
   * @return {*}
   */
  fetchCatalog() {
    const catalog = this.graph.find(null, 'rdf:type', 'dcat:Catalog')[0].getSubject();
    const temp = registry.get('entrystore').getContextById('__temporary');
    const ce = temp.newLink(catalog);
    ce.setMetadata(this.graph);
    return new Promise(resolve => resolve(ce));
  },

  fetchDistributions(datasetEntry) {
    const md = datasetEntry.getMetadata();
    const temp = registry.get('entrystore').getContextById('__temporary');
    const stmts = md.find(datasetEntry.getResourceURI(), 'dcat:distribution');
    const dists = stmts.map((stmt) => {
      const diURI = stmt.getValue();
      const di = temp.newLink(diURI);
      di.setMetadata(this.graph);
      return di;
    }, this);

    return new Promise(resolve => resolve(dists));
  },
});
