import Dataset from 'catalog/public/Dataset';
import registry from 'commons/registry';
import declare from 'dojo/_base/declare';

export default declare([Dataset], {
  inDialog: true,
  graph: null,

  postCreate() {
    this.inherited('postCreate', arguments);
    this.distributionInfoDialog.checkForAPI = false;
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
