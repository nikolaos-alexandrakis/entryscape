import registry from 'commons/registry';

const existsInCollection = (collection, value) => {
  if (Array.isArray(collection)) {
    return collection.includes(value);
  } else if (typeof collection === 'object') {
    return value in collection.keys();
  }

  return collection === value;
};

export const getDatatsetByDistributionURI = async (ruri, context) => {
  const es = registry.getEntryStore();
  const datasetEntries = new Map();
  await es.newSolrQuery()
    .context(context)
    .rdfType('dcat:Dataset')
    .uriProperty('dcat:distribution', ruri)
    .forEach((datasetEntry) => {
      /**
       * @type {rdfjson/Graph}
       */
      const md = datasetEntry.getMetadata();
      const distributionRURIs = md.objects(datasetEntry.getResourceURI(), 'dcat:distribution');
      /**
       * return only distributions that were passed in
       */
      const filteredDistributionRURIs =
        distributionRURIs.values().filter(distRURI => existsInCollection(ruri, distRURI));
      filteredDistributionRURIs.forEach(fileRURI => datasetEntries.set(fileRURI, datasetEntry));
    });
  return datasetEntries;
};

/**
 *
 * @param ruri
 * @param context
 * @return {Promise<Map<any, any>>}
 */
export const getDistributionByFileResourceURI = async (ruri, context) => {
  const es = registry.getEntryStore();
  const distributionEntries = new Map();
  await es.newSolrQuery()
    .context(context)
    .rdfType('dcat:Distribution')
    .uriProperty('dcat:downloadURL', ruri)
    .forEach((distributionEntry) => {
      /**
       * @type {rdfjson/Graph}
       */
      const md = distributionEntry.getMetadata();
      const distributionRURIs = md.objects(distributionEntry.getResourceURI(), 'dcat:downloadURL');
      distributionRURIs.values().forEach(fileRURI => distributionEntries.set(fileRURI, distributionEntry));
    });
  return distributionEntries;
};
