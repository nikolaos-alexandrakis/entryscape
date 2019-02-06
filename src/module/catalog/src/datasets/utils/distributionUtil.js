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
