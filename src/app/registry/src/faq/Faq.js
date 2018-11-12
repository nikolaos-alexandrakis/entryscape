import registry from 'commons/registry';
import declare from 'dojo/_base/declare';
import Bench from 'workbench/bench/Bench';

export default declare([Bench], {
  show(params) {
    params.context = 'faq';
    const es = registry.get('entrystore');
    const context = es.getContextById('faq');
    registry.set('context', context);
    this.inherited(arguments);
    this.checkIfCreated(context);
  },
  checkIfCreated(context) {
    if (registry.get('isAdmin')) {
      context.getEntry().then(null, () => {
        console.log('No FAQ context, creating it');
        const es = registry.get('entrystore');
        const nge = es.newGroup('faq', 'faq');
        nge.getMetadata().addL(nge.getResourceURI(), 'foaf:name', 'FAQ group');
        nge.commit().then((groupEntry) => {
          const nce = es.newContext('faq', 'faq');
          const cei = nce.getEntryInfo();
          const etype = es.getResourceURI('entitytypes', 'question');
          const ruri = nce.getResourceURI();
          const eigraph = cei.getGraph();
          eigraph.add(ruri, 'esterms:entityType', etype);
          eigraph.add(ruri, 'rdf:type', 'esterms:WorkbenchContext');

          const acl = cei.getACL(true);
          acl.rread.push('_guest');
          acl.mread.push('_guest');
          acl.mwrite.push(groupEntry.getId());
          acl.rwrite.push(groupEntry.getId());
          cei.setACL(acl);
          nce.getMetadata().addL(nge.getResourceURI(), 'dcterms:title', 'FAQ project');
          nce.commit().then((contextEntry) => {
            const groupResource = groupEntry.getResource(true);
            groupResource.setHomeContext(contextEntry.getId());
          });
        });
      });
    }
  },
});
