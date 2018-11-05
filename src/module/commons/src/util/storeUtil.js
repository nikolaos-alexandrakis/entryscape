import registry from '../registry';
import configUtil from './configUtil';

export const createEntry = (context, scope) => {
  const c = context || registry.get('context');
  const resourceBase = configUtil.getResourceBase(scope);
  if (resourceBase) {
    const resURI = _.template(resourceBase)({
      contextId: c.getId(),
      entryId: '_newId',
      uuid: utils.generateUUID()
    });
    return c.newLink(resURI);
  }
  return c.newNamedEntry();
};
