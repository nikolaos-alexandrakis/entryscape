import registry from 'commons/registry';

/**
 * Get the top level view for each module. Usually to be rendered in the left sidebar
 * @param module
 * @return {any[]}
 */
const getTopViewsOfModule = (module = null) => {
  const siteConfig = registry.getSiteConfig();
  const modules = module ? [module] : siteConfig.modules;

  /**
   * For each module get the views that are top level (i.e don't have a parent)
   * @type {Array}
   */
  return modules.map(m => siteConfig.views.filter(v => v.module === m.name && !v.parent));
};

/**
 * Find in which module a certain view belongs.
 *
 * Some views belong to no module, e.g start view
 * @param {Object|String} view
 * @return {Object|null}
 */
const getModuleOfView = (view) => {
  const site = registry.getSiteManager();
  let moduleName;
  if (typeof view === 'object') {
    moduleName = view.module;
  } else {
    const viewDef = site.getViewDef(view);
    moduleName = (viewDef && viewDef.module) || '';
  }

  const siteConfig = registry.getSiteConfig();
  return siteConfig.modules.find(m => m.name === moduleName) || null;
};

const getTopViewOfModule = (module) => {
  const views = getTopViewsOfModule(module);
  return views[0];
};

/**
 * Get all subviews that have a given view as parent. Use recursive for more than one level deep.
 * @param {string} viewName
 * @param {boolean} [recursive=false]
 * @return {Array}
 */
const getSubviewsOfView = (viewName, recursive = false) => {
  const siteConfig = registry.getSiteConfig();
  const views = siteConfig.views.filter(view => view.parent === viewName);
  if (recursive && views.length > 0) {
    return views.concat(views.map(getSubviewsOfView));
  }

  return views;
};

/**
 * @param mod
 * @param viewDef
 * @param topLevel (top level views can be either literally top level or the children of the
 * view that is set as startView in the module). Passing topLevel = true will retrieve the
 * latter.
 * @return {Array}
 */
const getTopLevelViewsOfModule = (mod = null, viewDef, topLevel = false) => {
  const module = mod || getModuleOfView(viewDef);
  if (topLevel) {
    return getTopViewOfModule(module);
  }

  return getSubviewsOfView(module.startView, false);
};

const getBreadcrumbViews = (viewDef, arr = []) => {
  if (viewDef.parent) {
    const parentView = registry.getSiteManager().getViewDef(viewDef.parent);
    getBreadcrumbViews(parentView, arr);
  }

  arr.push(viewDef.name);

  return arr;
};


/**
 * Get only the views that have a certain truthy value of a property ,e.g filterViewsByAttribute([], 'navbar');
 * @param {array} views
 * @param {string } filter
 * @private
 */
const filterViewsByAttribute = (views, filter) => views.filter(v => ((filter in v) ? v[filter] : true));

export {
  getTopLevelViewsOfModule,
  getTopViewsOfModule,
  getModuleOfView,
  getSubviewsOfView,
  filterViewsByAttribute,
  getBreadcrumbViews,
};
