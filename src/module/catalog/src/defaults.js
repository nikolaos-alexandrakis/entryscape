import registry from 'commons/registry';
import typeIndex from 'commons/create/typeIndex';
import config from 'config';

export default () => {
  const ns = registry.get('namespaces');
  ns.add('dcat', 'http://www.w3.org/ns/dcat#');
  ns.add('esterms', 'http://entryscape.com/terms/');

  // registry.set('withinDatasetLimit', (count) => { // TODO this doesn't seem to suitable for a registry value
  //   if (!registry.get('hasAdminRights') &&
  //     config.catalog && parseInt(config.catalog.datasetLimit, 10) === config.catalog.datasetLimit) {
  //     let exception = false;
  //     const premiumGroupId = config.entrystore.premiumGroupId;
  //     if (premiumGroupId) {
  //       const es = registry.get('entrystore');
  //       const groups = registry.get('userEntry').getParentGroups();
  //       exception = groups.some(groupEntryURI => es.getEntryId(groupEntryURI) === premiumGroupId);
  //     }
  //     const premiumContextLevel = registry.get('context')
  //       .getEntry(true)
  //       .getEntryInfo()
  //       .getGraph()
  //       .findFirstValue(null, 'store:premium');
  //
  //     if (premiumContextLevel) {
  //       exception = true;
  //     }
  //     return exception || count < parseInt(config.catalog.datasetLimit, 10);
  //   }
  //   return true;
  // });

// Copy over templates from catalog config to corresponding entitytypes
  const entities = ['publisher', 'catalog', 'dataset', 'distribution', 'contactPoint', 'datasetResult'];
  entities.forEach((e) => {
    const t = config.catalog[`${e}TemplateId`];
    const conf = typeIndex.getConfByName(e);
    if (t && conf) {
      conf.template = t;
    }
  });
}
