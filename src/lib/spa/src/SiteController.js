import PubSub from 'pubsub-js';
import declare from 'dojo/_base/declare';

const _findHierarchyNodeFor = (node, viewName) => {
  if (node.view === viewName) {
    return node;
  }
  if (node.subViews != null) {
    for (let i = 0; i < node.subViews.length; i++) {
      const sv = node.subViews[i];
      if (typeof sv === 'object') {
        return _findHierarchyNodeFor(node.subViews[i], viewName);
      }
    }
  }

  return undefined;
};

const _findParentHierarchyNodeFor = (node, viewName) => {
  if (node.subViews != null) {
    for (let i = 0; i < node.subViews.length; i++) {
      const sv = node.subViews[i];
      const svType = typeof sv;
      if ((svType === 'string' && viewName === sv) || (
        svType === 'array' && sv.view === viewName
      )) {
        return node;
      }
    }
    for (let i = 0; i < node.subViews.length; i++) {
      const sv = node.subViews[i];
      if (typeof sv === 'object') {
        return _findParentHierarchyNodeFor(sv, viewName);
      }
    }
  }

  return undefined;
};

/**
 * TODO
 * @param views
 * @param filter
 * @private
 */
const _filterViews = (views, filter) => views.filter(v => ((filter in v) ? v[filter] : true));

export default declare(null, {
  //= ==================================================
  // Inherited methods
  //= ==================================================
  constructor(params) {
    this.site = params.site;
    // const callShow = (res, args) => {
    //   const {switchingToView, switchingToParams} = args;
    //   this.show.call(this, switchingToView, switchingToParams);
    // }

    PubSub.subscribe('spa.beforeViewChange', (res, args) => {
      const {switchingToView, switchingToParams} = args;
      this.show.call(this, switchingToView, switchingToParams);
    });
  },

  //= ==================================================
  // Public API
  //= ==================================================
  show(viewName, params) {
  },

  /**
   * TODO
   * @param viewName
   * @param deep
   */
  getSubViews(viewName, deep = false) { // TODO 1. set deep = true 2. use recursion
    const config = this.site.getConfig();

    const res = config.views.filter(view => view.parent === viewName);
    if (deep && res.length > 0) {
      return res.concat(res.map(this.getSubViews));
    }

    return res;
  },

  /**
   * @param view {Object|String} A view name or view definition
   * @return {Array} of view definitions that have the same parent as view
   */
  getSiblingViews(view) {
    const config = this.site.getConfig();
    const viewDef = (typeof view === 'object') ? view : this.site.getViewDef(view);

    if (viewDef.parent) {
      return config.views.filter(v => v.parent === viewDef.parent);
    }

    return [];
  },

  /**
   *
   * @param viewName
   * @return {Object}
   */
  getNavBarInfo(viewName) {
    const config = this.site.getConfig();
    let views = [];
    let wideSidebar;
    const alwaysSidebar = (config.sidebar && config.sidebar.always);
    const alwaysWideSidebar = config.sidebar && config.sidebar.wide === true;
    const onlySidebar = false;
    const viewDef = this.site.getViewDef(viewName);
    const module = this.getViewModule(viewName);

    if (viewDef.parent) {
      views = this.getSubViews(viewDef.parent);
      views = _filterViews(views, 'navbar');
      if (views.length > 0 && (module.sidebar || alwaysSidebar)) {
        wideSidebar = module.wideSidebar;
      }
    } else if (module) {
      const viewsArray = this.getModuleTopLevelViews(module, viewDef, true);
      views = (viewsArray.length > 1) ? viewsArray : [viewDef];
    } else {
      views = [viewDef];
    }

    return {
      show: views.length > 1,
      views: views || [],
      wide: wideSidebar === true || alwaysWideSidebar,
      alone: onlySidebar,
    };
  },

  /**
   * Find in which module a certain view belongs.
   *
   * Some views belong to no module, e.g start view
   * @param view
   * @return {Object|null}
   */
  getViewModule(view) {
    let moduleName;
    if (typeof view === 'object') {
      moduleName = view.module;
    } else {
      const viewDef = this.site.getViewDef(view);
      moduleName = (viewDef && viewDef.module) || '';
    }

    const config = this.site.getConfig();
    return config.modules.find(m => m.name === moduleName) || null;
  },

  /**
   * Get the top level view for each module. Usually to be rendered in the left sidebar
   * @param module
   * @return {any[]}
   */
  getModulesTopViews(module = null) {
    const config = this.site.getConfig();
    const modules = module ? [module] : config.modules;

    /**
     * For each module get the views that are top level (i.e don't have a parent)
     * @type {Array}
     */
    return modules.map(m => config.views.filter(v => v.module === m.name && !v.parent));
  },

  getModuleTopViews(module) {
    const viewsArray = this.getModulesTopViews(module);
    return viewsArray[0];
  },

  /**
   *
   * @param moduleName
   * @return {Array}
   */
  getModuleViewsDef(moduleName) {
    const config = this.site.getConfig();
    return config.views.filter(view => (('module' in view) ? view.module === moduleName : false));
  },

  /**
   * @param mod
   * @param viewDef
   * @param topLevel (top level views can be either literally top level or the children of the
   * view that is set as startView in the module). Passing topLevel = true will retrieve the
   * latter.
   * @return {Array}
   */
  getModuleTopLevelViews(mod = null, viewDef, topLevel = false) {
    const module = mod || this.getViewModule(viewDef);
    if (topLevel) {
      return this.getModuleTopViews(module);
    }

    return this.getSubViews(module.startView, false);
  },

  getBreadcrumbViews(viewDef, arr = []) {
    if (viewDef.parent) {
      const parentView = this.site.getViewDef(viewDef.parent);
      this.getBreadcrumbViews(parentView, arr);
    }

    arr.push(viewDef.name);

    return arr;
  }
});
