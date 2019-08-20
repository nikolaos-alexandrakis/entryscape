/**
 * @param {store/Entry} suggestionEntry
 * @return {{unlink: *, link: *}}
 */
export default (suggestionEntry) => {
  /**
   * @param datasetRURI
   * @return {Promise<store/Entry>}
   */
  const link = async (datasetRURI) => {
    const md = suggestionEntry.getMetadata();
    const suggestionRURI = suggestionEntry.getResourceURI();
    md.add(suggestionRURI, 'dcterms:references', datasetRURI);

    try {
      return await suggestionEntry.setMetadata(md).commitMetadata();
    } catch (err) {
      console.error(`Could not link suggestion ${suggestionRURI} with dataset ${datasetRURI}`);
      console.log(err);
    }
    return suggestionEntry;
  };

  /**
   * @param datasetRURI
   * @return {Promise<store/Entry>}
   */
  const unlink = async (datasetRURI) => {
    const md = suggestionEntry.getMetadata();
    const suggestionRURI = suggestionEntry.getResourceURI();
    md.findAndRemove(suggestionRURI, 'dcterms:references', datasetRURI);

    try {
      return await suggestionEntry.commitMetadata();
    } catch (err) {
      console.error(`Could not unlink suggestion ${suggestionRURI} with dataset ${datasetRURI}`);
      console.log(err);
    }

    return suggestionEntry;
  };

  return {
    link,
    unlink,
  };
};
