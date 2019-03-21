import registry from 'commons/registry';

/**
 * @param {store/Context} catalogContext
 * @return {*}
 */
const isCatalogPublished = async (catalogContext = null) => {
  const context = catalogContext || registry.getContext();
  const contextEntry = await context.getEntry();
  const entryInfo = contextEntry.getEntryInfo();
  const acl = entryInfo.getACL(true);
  return acl.rread.includes('_guest');
};

export {
  isCatalogPublished,
};
