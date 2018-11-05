import registry from 'commons/registry';
import typeIndex from 'commons/create/typeIndex';
import config from 'config';

const defaultWithinDatasetLimit = (count) => {
  if (!registry.get('hasAdminRights') &&
    config.catalog && parseInt(config.catalog.datasetLimit, 10) === config.catalog.datasetLimit) {
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
    return exception || count < parseInt(config.catalog.datasetLimit, 10);
  }
  return true;
};

// TODO @valentino this is currently redundant but it's needed so that registry.get works in local.js, e.g free/local.js
// when these functions are removed from registry then just keep the defaultWithinDatasetLimit export
registry.set('withinDatasetLimit', defaultWithinDatasetLimit);

// if the dataset limit function is set via registry than use that
export const withinDatasetLimit = registry.get('withinDatasetLimit') || defaultWithinDatasetLimit;
