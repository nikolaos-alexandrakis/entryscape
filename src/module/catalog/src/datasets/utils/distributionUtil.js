import registry from 'commons/registry';

/**
 * Get files uri from the distribution entry graph. The connector property is 'dcat:downloadURL'
 *
 * @param {store/Entry} distributionEntry
 * @return {array<string>}
 */
export const getDistributionFileRURIs = (distributionEntry) => {
  const fileStmts = distributionEntry.getMetadata().find(distributionEntry.getResourceURI(), 'dcat:downloadURL');
  return fileStmts.map(statement => statement.getValue());
};

/**
 * Get the file
 * @param {store/Entry} distributionEntry
 * @return {Promise<Array<{sizeOfFile: number, format: string, resourceURI: string}> | never>}
 */
export const getDistributionFileEntries = (distributionEntry) => {
  const esu = registry.get('entrystoreutil');

  /**
   * Get all the URIs of the files for this distribution
   * @type {Array<string>}
   */
  const fileURIs = getDistributionFileRURIs(distributionEntry);

  /**
   * Get the entries of all the fileURIs
   * @type {Array<entryPromise>}
   */
  const entryResourcePromises = fileURIs.map(uri => esu.getEntryByResourceURI(uri));
  return Promise.all(entryResourcePromises)
    .catch((err) => {
      console.error(err);
      throw Error(`Could retrieve a file entry from distribution ${distributionEntry.getId()}  ${err.message}`);
    });
};

/**
 * @param {store/Entry} distributionEntry
 * @return {Promise<Array<Object>>}
 */
export const getDistributionFilesInfo = async (distributionEntry) => {
  const entries = await getDistributionFileEntries(distributionEntry);
  return entries.map((entry) => {
    /** @type {string} */
    const resourceURI = entry.getResourceURI();
    /** @type {string} */
    const format = entry.getEntryInfo().getFormat();
    /** @type {String} */
    const sizeOfFile = entry.getEntryInfo().getSize();

    return {
      resourceURI,
      format,
      sizeOfFile,
    };
  });
};

export const isFileDistributionWithOutAPI = (entry, dctSource, entrystore) => {
  // old code to check API activated or not
  const fileStmts = entry.getMetadata().find(entry.getResourceURI(),
    'dcat:downloadURL');
  const es = entrystore;
  const baseURI = es.getBaseURI();
  const apiResourceURIs = dctSource;
  const old = fileStmts.every((fileStmt) => {
    const fileResourceURI = fileStmt.getValue();
    return (fileResourceURI.indexOf(baseURI) > -1) &&
      (apiResourceURIs.indexOf(fileResourceURI) !== -1);
  });
  if (!old) {
    // new code apiDistribution have dct:source to parentFileDistribution
    return (apiResourceURIs.indexOf(entry.getResourceURI()) === -1);
  }
  return !old;
};

export const isSingleFileDistribution = (entry) => {
  const fileStmts = entry.getMetadata().find(entry.getResourceURI(), 'dcat:downloadURL');
  return fileStmts.length === 1;
};

export const isAPIDistribution = (entry) => {
  const ns = registry.get('namespaces');
  const md = entry.getMetadata();
  const subj = entry.getResourceURI();
  const source = md.findFirstValue(subj, ns.expand('dcterms:source'));
  return !!((source !== '' && source != null));
};

export const isUploadedDistribution = (entry, entrystore) => {
  const ns = registry.get('namespaces');
  const md = entry.getMetadata();
  const subj = entry.getResourceURI();
  const downloadURI = md.findFirstValue(subj, ns.expand('dcat:downloadURL'));
  const es = entrystore;
  const baseURI = es.getBaseURI();
  return !!((downloadURI !== '' && downloadURI != null && downloadURI.indexOf(baseURI) > -1));
};

export const isAccessDistribution = (entry, entrystore) => {
  const ns = registry.get('namespaces');
  const md = entry.getMetadata();
  const subj = entry.getResourceURI();
  const accessURI = md.findFirstValue(subj, ns.expand('dcat:accessURL'));
  const downloadURI = md.findFirstValue(subj, ns.expand('dcat:downloadURL'));
  const base = entrystore.getBaseURI();
  return accessURI !== downloadURI || downloadURI.indexOf(base) !== 0;
};

export const isAccessURLEmpty = (entry) => {
  const ns = registry.get('namespaces');
  const md = entry.getMetadata();
  const subj = entry.getResourceURI();
  const accessURI = md.findFirstValue(subj, ns.expand('dcat:accessURL'));
  return !((accessURI !== '' && accessURI != null));
};

/**
 * Checks if there is a dcat:downloadURL for an entry
 *
 * @param {store/Entry} entry
 * @returns {boolean}
 */
export const isDownloadURLEmpty = (entry) => {
  const ns = registry.get('namespaces');
  const md = entry.getMetadata();
  const subj = entry.getResourceURI();
  const downloadURI = md.findFirstValue(subj, ns.expand('dcat:downloadURL'));
  return !((downloadURI !== '' && downloadURI != null));
};

export const getDistributionTemplate = (templateId, dtemplate) => {
  if (!dtemplate) { // TODO @scazan don't forget to re-institute this!!!!
    return registry.get('itemstore').getItem(templateId);
  }
  return dtemplate;
};

export const isPrivatelyPublished = entry => !entry.getMetadata()
  .findFirstValue(null, 'http://entryscape.com/terms/psi');
