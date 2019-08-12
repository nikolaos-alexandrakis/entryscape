export default (entry) => {
  const updateFileEntries = () => {
    const entryStoreUtil = registry.get('entrystoreutil');

    Promise.all(
      entry
        .getMetadata()
        .find(entry.getResourceURI(), 'dcat:downloadURL')
        .map(statement => entryStoreUtil.getEntryByResourceURI(statement.getValue())),
    ).then(fileEntries => setState({ fileEntries }));
  };

  return {
    updateFileEntries,
  };
};
