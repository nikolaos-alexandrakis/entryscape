import registry from 'commons/registry';
import List from 'catalog/datasets/List';
import declare from 'dojo/_base/declare';

export default declare([List], {
  show(params) {
    this.inherited(arguments);
    const es = registry.get('entrystore');
    const context = es.getContextById(params.context);
    registry.set('context', context);
    this.inherited(arguments);
    this.checkIfCreated(context);
  },
  checkIfCreated(context) {
    if (registry.get('isAdmin')) {
      context.getEntry().then(null, () => {
        console.log('No test context, creating it');
        const es = registry.get('entrystore');
        const contextId = context.getId();
        const nce = es.newContext(contextId, contextId);
        const cei = nce.getEntryInfo();
        const ruri = nce.getResourceURI();
        const eigraph = cei.getGraph();
        eigraph.add(ruri, 'rdf:type', 'esterms:CatalogContext');

        const acl = cei.getACL(true);
        acl.mwrite.push('_users');
        acl.rwrite.push('_users');
        cei.setACL(acl);
        nce.getMetadata().addL(nce.getResourceURI(), 'dcterms:title', 'Test catalog');
        nce.commit().then(() => {
          const nne = context.newNamedEntry();
          const catMd = nne.getMetadata();
          catMd.add(nne.getResourceURI(), 'rdf:type', 'dcat:Catalog');
          catMd.addL(nne.getResourceURI(), 'dcterms:title', 'Test catalog');
          nne.commit();
        });
      });
    }
  },
});
