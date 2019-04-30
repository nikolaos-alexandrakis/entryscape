import registry from 'commons/registry';

/**
 *
 * @param {store/Entry} entry
 * @return {rdfjson|Statement[]}
 */
const getDistributionStatements = entry => entry.getMetadata().find(entry.getResourceURI(), 'dcat:distribution');

/**
 *
 * @param {store/Entry} datasetEntry
 * @param {undefined|Array} formatFilters
 * @return {Promise<Array>}
 */
const getUploadedDistributionEntries = async (datasetEntry, formatFilters) => {
  const entryStoreUtil = registry.get('entrystoreutil');
  const stmts = getDistributionStatements(datasetEntry);

  const distributionPromises = stmts.map(stmt => entryStoreUtil.getEntryByResourceURI(stmt.getValue()));
  const distributionEntries = [];

  for await (const distEntry of distributionPromises) { // eslint-disable-line
    const distributionRURI = distEntry.getResourceURI();
    if (formatFilters) {
      const format = distEntry.getMetadata().findFirstValue(distributionRURI, 'dcterms:format');
      if (formatFilters.includes(format)) {
        distributionEntries.push(distEntry);
      }
    } else {
      distributionEntries.push(distEntry);
    }
  }

  return distributionEntries;
};

export {
  getDistributionStatements,
  getUploadedDistributionEntries,
};
