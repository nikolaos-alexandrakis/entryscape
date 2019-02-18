import registry from 'commons/registry';
import { createRowstorePipeline } from 'commons/util/storeUtil';

/**
 *
 * @returns {Promise<store/Resource>}
 */
const getPipelineResource = () => {
  const context = registry.get('context');
  const async = registry.get('asynchandler');
  async.addIgnore('getEntry', async.codes.GENERIC_PROBLEM, true);
  return context.getEntryById('rowstorePipeline')
    .catch(() => createRowstorePipeline(context)) // if the 'rowstorePieline' entry doesn't exist then create
    .then(pipeline => pipeline.getResource());
};

const removeAlias = etlEntry => getPipelineResource().then((pres) => {
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
});

const setAlias = (etlEntry, aliasName) => getPipelineResource().then((pres) => {
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
});

export default {
  getPipelineResource,
  removeAlias,
  setAlias,
};
