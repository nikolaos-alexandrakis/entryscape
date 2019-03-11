import m from 'mithril';
import registry from 'commons/registry';
import ConfigError from 'spa/ConfigError';
import SiteClass from 'spa/Site';

//= ==================================================
// CONFIG VALIDATION FUNCTIONS
//= ==================================================
const hasRoute = view => 'route' in view;
const parentExists = (view, views) => ('parent' in view ? views.has(view.parent) : true);
const moduleExists = (view, views, modules) => ('module' in view ? modules.has(view.module) : true);
const hasStartingView = (module, views) => 'startView' in module && views.has(module.startView);

const viewValidationFuncs = [
  hasRoute,
  parentExists,
  moduleExists,
];

const moduleValidationFuncs = [
  hasStartingView,
];

/**
 * A wrapper around main spa/Site that is aware of modules (apart from views) and
 * checks if a requested view can be shown.
 */
class Site extends SiteClass {
  constructor() {
    super(arguments);
    this.modules = new Map();

    registry.onChange('userEntry', this.registerViews.bind(this));
  }

  registerViews() {
    this.registerModules();
    super.registerViews();
  }

  /**
   * Calls a specific views canShowView function if it exists and if a public flag is not
   * present in the view configuration, otherwise returns true Promise
   * Changes to a warning view if canShowView returns false.
   *
   * @param view
   * @param params
   *
   * @return {Promise}
   */
  canShowView(view, params) {
    // TODO a hack since we are assuming the current view is the view we are checking for.
    const viewName = this.getUpcomingOrCurrentView();
    const viewDef = this.getViewDef(viewName);
    if ('public' in viewDef && viewDef.public) {
      return new Promise(resolve => resolve(true));
    } else if (typeof view.canShowView === 'function') {
      return view.canShowView(params).then((canShow) => {
        if (!canShow) {
          this.changeToSomeWarningView();
        }

        return canShow;
      });
    }
    // canShowView is not present in view
    return new Promise(resolve => resolve(true));
  }

  /**
   * Opens a sign-in or permission denied view
   */
  changeToSomeWarningView() {
    const authorizedUser = registry.get('authorizedUser');
    const userInfoId = registry.get('userInfo').id;
    const isNotSignedIn = authorizedUser == null || userInfoId === '_guest';
    const isSigningOut = userInfoId !== '_guest'; // If we are being redirected to a
    // warning view and the user
    const view = this.getUpcomingOrCurrentView();
    let viewParams = Object.assign({}, this.getUpcomingOrCurrentParams(view));

    if (isSigningOut) {
      viewParams = {};
    }

    const viewName = isNotSignedIn ?
      this.getConfig().signinView : this.getConfig().permissionView;

    // Open singin or permission view
    this.render(viewName, viewParams);
  }

  /**
   * Register all active and acl permitted modules
   */
  registerModules() {
    const activeModules = this.config.modules.filter((module) => {
      switch (module.restrictTo || module.public || '') {
        case 'adminUser':
          return registry.get('isAdmin');
        case 'adminGroup':
          return registry.get('inAdminGroup');
        case 'admin':
          return registry.get('hasAdminRights');
        case true: // case where module.public = true;
        default:
          return true;
      }
    });

    this.modules = new Map();
    activeModules.forEach(module => this.modules.set(module.name, module), this);
  }

  getSelectedModule() {
    const view = this.getUpcomingOrCurrentView();
    let moduleName;

    if (typeof view === 'object') {
      moduleName = view.module;
    } else {
      const viewDef = this.getViewDef(view);
      moduleName = (viewDef && viewDef.module) || '';
    }

    return this.modules.get(moduleName);
  }

  /**
   * Delete all views that are registered but their module is not enabled
   *
   * @private
   */
  _unRegisterDisabledViews() {
    const unregisterViews = [];
    const unregisterRoutes = [];

    // find views that have a module defined but module is not registered
    this._views.forEach((viewDef, viewName) => {
      if ('module' in viewDef && !this.modules.has(viewDef.module)) {
        unregisterViews.push(viewName);
        unregisterRoutes.push(viewDef.route);
      }
    });

    // unregister views
    unregisterViews.forEach(this._views.delete.bind(this._views));
    unregisterRoutes.forEach(this._router.remove, this._router);
  }

  /**
   * Validate views and modules
   */
  validateConfiguration() {
    this._validateViews();
    this._validateModules();
  }

  /**
   * Run a set (array) of checks on each view definition
   * @private
   * @throws ConfigError
   */
  _validateViews() {
    this._views.forEach((viewDef, viewName) => {
      const allValid = viewValidationFuncs.every(func => func(viewDef, this.getViews(), this.modules));
      if (!allValid) {
        throw new ConfigError(`${viewName} view is not configured correctly`);
      }
    });
  }

  /**
   * Run a set (array) of checks on each module definition
   * @private
   * @throws ConfigError
   */
  _validateModules() {
    this.modules.forEach((moduleDef, moduleName) => {
      const allValid = moduleValidationFuncs.every(func => func(moduleDef, this.getViews()));
      if (!allValid) {
        throw new ConfigError(`${moduleName} module is not configured correctly`);
      }
    });
  }
}

export default Site;
