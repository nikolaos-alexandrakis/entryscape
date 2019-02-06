/* eslint-disable import/prefer-default-export */
import registry from 'commons/registry';
import configUtil from './configUtil';

export const createEntry = (context, scope) => {
  const c = context || registry.get('context');
  const resourceBase = configUtil.getResourceBase(scope);
  if (resourceBase) {
    const resURI = _.template(resourceBase)({
      contextId: c.getId(),
      entryId: '_newId',
      uuid: utils.generateUUID(),
    });
    return c.newLink(resURI);
  }
  return c.newNamedEntry();
};

export const createRowstorePipeline = (context) => {
  const pipelinePrototypeEntry = context.newPipeline('rowstorePipeline');
  const pipelineResource = pipelinePrototypeEntry.getResource();
  pipelineResource.addTransform(pipelineResource.transformTypes.ROWSTORE, {});
  return pipelinePrototypeEntry.commit();
};
