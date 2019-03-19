import registry from 'commons/registry';

/**
 * @todo @valentino make generic util
 * @param collection
 * @param value
 * @return {*}
 */
const existsInCollection = (collection, value) => {
  if (Array.isArray(collection)) {
    return collection.includes(value);
  } else if (typeof collection === 'object') {
    return value in collection.keys();
  }

  return collection === value;
};

/**
 * @todo @valentino reevaluate efficacy
 *
 *
 * @param resourceURIS
 * @param context
 * @param rdfType
 * @param property
 * @param entriesMap
 * @return {promise}
 */
const requestSolr = (resourceURIS, context, rdfType, property, entriesMap) => {
  const es = registry.getEntryStore();
  return es.newSolrQuery()
    .context(context)
    .rdfType(rdfType)
    .uriProperty(property, resourceURIS)
    .forEach((entry) => {
      /** @type Array */
      const filteredResultEntriesRURIs = entry
        .getMetadata()
        .objects(entry.getResourceURI(), property)
        .values()
        .filter(uri => existsInCollection(resourceURIS, uri)); // make sure what was retrieved is relevant

      // make the association between the uri and the entry
      filteredResultEntriesRURIs.forEach(fileRURI => entriesMap.set(fileRURI, entry));
    });
};

/**
 * Split a potentially very long solr request to a shorter one so that apache doesn't return 414.
 * Current max limit is 20 resource uris in the request.
 *
 * @param ruri
 * @param context
 * @return {Promise<Map<any, any>>}
 */
const requestSolrInChunks = async (ruri, context, rdfType, property) => {
  const entries = new Map();

  const MAX_URIS_IN_OR_QUERY = 20; // 20
  let START_IDX = 0;
  let END_IDX = MAX_URIS_IN_OR_QUERY;
  const promises = [];
  if (Array.isArray(ruri)) {
    /** @type Array */
    let ruris = ruri;
    while (ruris.length > 0) {
      // get next chunk
      ruris = ruris.slice(START_IDX, END_IDX);

      // make a solr request query
      promises.push(requestSolr(ruris, context, rdfType, property, entries));

      // update loop
      START_IDX += END_IDX;
      END_IDX += MAX_URIS_IN_OR_QUERY;
    }
  } else {
    promises.push(requestSolr([ruri], context, rdfType, property, entries));
  }

  await Promise.all(promises);

  return entries;
};

const getDatatsetByDistributionURI = async (ruri, context) => {
  const entries = await requestSolrInChunks(ruri, context, 'dcat:Dataset', 'dcat:distribution');
  return entries;
};

/**
 *
 * @param {String|Array} ruri
 * @param context
 * @return {Promise<Map<any, any>>}
 */
const getDistributionByFileResourceURI = async (ruri, context) => {
  const entries = await requestSolrInChunks(ruri, context, 'dcat:Distribution', 'dcat:downloadURL');
  return entries;
};

export {
  getDatatsetByDistributionURI,
  getDistributionByFileResourceURI,
};
