import registry from 'commons/registry';

export default {
  getPipelineResource: () => {
    const context = registry.get('context');
    const async = registry.get('asynchandler');
    async.addIgnore('getEntry', async.codes.GENERIC_PROBLEM, true);
    return context.getEntryById('rowstorePipeline').then(
      null, () => {
        const pipProtEnt = context.newPipeline('rowstorePipeline');
        const pipRes = pipProtEnt.getResource();
        pipRes.addTransform(pipRes.transformTypes.ROWSTORE, {});
        return pipProtEnt.commit();
      }).then(pipeline => pipeline.getResource());
  },
  removeAlias: etlEntry => pu.getPipelineResource().then((pres) => {
    const transformId = pres.getTransformForType(pres.transformTypes.ROWSTORE);
    pres.setTransformArguments(transformId, {});
    pres.setTransformArguments(transformId, {
      action: 'setalias',
      datasetURL: etlEntry.getResourceURI(),
    });
    return pres.commit().then(() => {
      const async = registry.get('asynchandler');
      async.addIgnore('execute', async.codes.GENERIC_PROBLEM, true);
      return pres.execute(null, {});
    });
  }),
  setAlias: (etlEntry, aliasName) => pu.getPipelineResource().then((pres) => {
    const transformId = pres.getTransformForType(pres.transformTypes.ROWSTORE);
    pres.setTransformArguments(transformId, {});
    pres.setTransformArguments(transformId, {
      action: 'setalias',
      alias: aliasName,
      datasetURL: etlEntry.getResourceURI(),
    });
    return pres.commit().then(() => {
      const async = registry.get('asynchandler');
      async.addIgnore('execute', async.codes.GENERIC_PROBLEM, true);
      return pres.execute(null, {});
    });
  }),
};
