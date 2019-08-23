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

/**
 * Navigate to the parent Catalog of this dataset
 *
 * @returns {undefined}
 */
const navigateToCatalogView = (viewPathKey, withDelay = false, delayMillis = 2000) => {
  const site = registry.get('siteManager');
  const state = site.getState();
  const { context } = state[state.view];
  if (withDelay) {
    const async = registry.get('asynchandler');
    async.openDialog(true);
    setTimeout(() => { // In order to avoid a slow solr re-index
      async.closeDialog(true);
      site.render(viewPathKey, { context });
    }, delayMillis);
  } else {
    site.render(viewPathKey, { context });
  }
};

export {
  isCatalogPublished,
  navigateToCatalogView,
};
