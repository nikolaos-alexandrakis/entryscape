const id2status = [
  'created',
  'accepted',
  'processing',
  'available',
  'error',
];

export default {
  load: etlEntry => etlEntry.getEntryStore()
    .loadViaProxy(etlEntry.getEntryInfo().getExternalMetadataURI()),
  oldStatus: etlEntry => etlEntry.getMetadata().findFirstValue(etlEntry.getResourceURI(),
    'store:pipelineResultStatus'),
  status: data => id2status[data.status],
  update: (etlEntry, data) => {
    etlEntry.setRefreshNeeded();
    return etlEntry.refresh().then(() => {
      const status = id2status[data.status];
      const extMD = etlEntry.getCachedExternalMetadata();
      const resURI = etlEntry.getResourceURI();
      // Status
      extMD.findAndRemove(resURI, 'store:pipelineResultStatus');
      extMD.addL(resURI, 'store:pipelineResultStatus', status);
      // Columns
      extMD.findAndRemove(resURI, 'store:pipelineResultColumnName');
      if (data.status === 3 && data.columnnames) {
        data.columnnames.forEach(col => extMD.addL(resURI, 'store:pipelineResultColumnName', col));
      }
      // Alias
      extMD.findAndRemove(resURI, 'store:aliasName');
      if (data.aliases && data.aliases.length > 0) {
        extMD.addL(resURI, 'store:aliasName', data.aliases[0]);
      }
      return etlEntry.commitCachedExternalMetadata();
    });
  },
  updateAliasInEntry: (etlEntry, aliasName) => {
    const extMD = etlEntry.getCachedExternalMetadata();
    const resURI = etlEntry.getResourceURI();
    if (aliasName) {
      extMD.addL(resURI, 'store:aliasName', aliasName);
    } else {
      extMD.findAndRemove(resURI, 'store:aliasName');
    }
    return etlEntry.commitCachedExternalMetadata();
  },
};
