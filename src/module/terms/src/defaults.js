import registry from 'commons/registry';
import config from 'config';
import 'commons/rdforms/linkBehaviour';
import 'jstree-bootstrap-theme/dist/themes/proton/style.min.css';

export default () => {
  const ns = registry.get('namespaces');
  ns.add('skos', 'http://www.w3.org/2004/02/skos/core#');
  ns.add('esterms', 'http://entryscape.com/terms/');
  ns.add('void', 'http://rdfs.org/ns/void#');

  const cid2count = {};

  // TODO @valentino all the below don't qualify for storing in registry
  registry.set('setConceptCount', (count) => {
    const cid = registry.get('context').getId();
    cid2count[cid] = count;
  });
  registry.set('incrementConceptCount', () => {
    const cid = registry.get('context').getId();
    cid2count[cid] = typeof cid2count[cid] === 'undefined' ? 1 : cid2count[cid] + 1;
  });
  registry.set('decrementConceptCount', () => {
    const cid = registry.get('context').getId();
    cid2count[cid] = typeof cid2count[cid] === 'undefined' ? 0 : cid2count[cid] - 1;
  });
  registry.set('getConceptCount', () => {
    const cid = registry.get('context').getId();
    return cid2count[cid];
  });
  registry.set('loadConceptCountIfNeeded', () => {
    const cid = registry.get('context').getId();
    if (typeof cid2count[cid] === 'undefined') {
      /** @type {store/EntryStore} */
      const es = registry.get('entrystore');

      const sl = es.newSolrQuery().rdfType('skos:Concept').context(registry.get('context'))
        .sort('modified+desc')
        .limit(0)
        .list();
      sl.getEntries(0).then(() => {
        cid2count[cid] = sl.getSize();
      });
    }
  });
  registry.set('withinConceptLimit', () => {
    const count = registry.get('getConceptCount')();
    if (!registry.get('hasAdminRights') && config.terms
      && parseInt(config.terms.conceptLimit, 10) === config.terms.conceptLimit) {
      let exception = false;
      const premiumGroupId = config.entrystore.premiumGroupId;
      if (premiumGroupId) {
        const es = registry.get('entrystore');
        const groups = registry.get('userEntry').getParentGroups();
        exception = groups.some(groupEntryURI => es.getEntryId(groupEntryURI) === premiumGroupId);
      }
      const premiumContextLevel = registry.get('context')
        .getEntry(true)
        .getEntryInfo()
        .getGraph()
        .findFirstValue(null, 'store:premium');

      if (premiumContextLevel) {
        exception = true;
      }
      if (!exception && count >= parseInt(config.terms.conceptLimit, 10)) {
        registry.get('dialogs').restriction(config.terms.conceptLimitDialog);
        return false;
      }
    }
    return true;
  });
};
