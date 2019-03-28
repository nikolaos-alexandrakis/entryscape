import registry from 'commons/registry';

/**
 * @param {store/Context} catalogContext
 * @return {*}
 */
const isCatalogPublished = async (catalogContext = null) => {
  const context = catalogContext || registry.getContext();
  const contextEntry = await context.getEntry();
  return contextEntry.isPublic();
};

export {
  isCatalogPublished,
};
