import PubSub from 'pubsub-js';
import ConfigError from './ConfigError';

const domNodeHide = (n) => { n.style.display = 'none'; };
const domNodeShow = (n) => { n.style.display = ''; }; // TODO set to initial or block?

/**
 * Base class for displaying a set of interchangable views.
 */
export default class Site {
  config = null;
  startView = null;
  startParams = null;
  viewsNode = null;
  views = null;
  controlNode = null;
  controlClass = null;
  controllerConstructorParams = null;

  //= ==================================================
  // Private Attributes
  //= ==================================================
  _baseUrl = '';
  _currentView = '';
  _controller = null;
  _views = null;
  _viewsObjects = null;

  constructor(params) {
    const { config, router: RouterClass, handler: HandlerClass, queryParams } = params[0]; // TODO @valentino dunno why this is needed
    this._setConfig(config); // TODO @valentino unnecessary, just do this.config = config

    this._router = new RouterClass(queryParams);
    this._handler = new HandlerClass(queryParams, this);
    this._views = new Map();
    this._viewsObjects = new Map();
    this._queue = [];
    this._ignoreSpaHandler = false;
  }

  //= ==================================================
  // Public API
  //= ==================================================
  getCurrentView() {
    const state = this.getState();
    if (state && 'view' in state) {
      return state.view;
    }

    return null;
  }

  /**
   * Return a map of views, <viewName, viewDef>
   * @return {Map}
   */
  getViews() {
    return this._views;
  }


  /**
   * Get the name of the current rendered view or in the _process of rendering view
   *
   * @return {String}
   */
  getUpcomingOrCurrentView() {
    const state = this.getState();
    return state.upcomingView || state.view;
  }


  /**
   * Get the params of the current rendered view or in the _process of rendering view
   *
   * @return {Object}
   */
  getUpcomingOrCurrentParams() {
    const state = this.getState();
    const viewName = ('upcomingView' in state) ? state.upcomingView : state.view;

    return this.getViewParams(viewName);
  }

  /**
   * @param view
   * @return {*|{}}
   */
  getViewParams(view) {
    const state = this.getState();
    return state[view] || {};
  }

  /**
   * Re-opens current view
   */
  reRenderCurrentView() {
    const view = this.getCurrentView();
    const params = this.getViewParams(view);
    this.render(view, params);
  }


  /**
   * A copy of the router state
   *
   * @return {*}
   */
  getState() {
    return this._router.getState();
  }

  /**
   * Merges a given object with a copy of history.state to history.state
   * @param obj e.g { context: 5 }
   */
  updateStateParams(obj, deleteKeys = []) {
    const mergedObj = Object.assign({}, this.getState(), obj);
    deleteKeys.forEach(key => delete mergedObj[key]);
    this._router.updateStateParams(mergedObj);
  }

  /**
   * Merges a given object with a copy of history.state
   * @param obj e.g { context: 5 }
   */
  updateViewParams(view, params, isUpcoming = false) {
    const viewKey = isUpcoming ? 'upcomingView' : 'view';
    const obj = {};

    obj[viewKey] = view;
    obj[view] = params;

    this.updateStateParams(obj, !isUpcoming ? ['upcomingView'] : []);
  }

  /**
   * Get the view definition from a viewId or path
   * @param viewId (can also be a path)
   * @return {Object|undefined}
   */
  getViewDef(viewId) {
    return this._views.get(viewId);
  }

  /**
   * Return a url for a view or the app's default url
   * @param viewId
   * @return {String}
   */
  getViewRoute(viewId) {
    const viewDef = this.getViewDef(viewId) || this.getViewDef(this.config.startView);

    return viewDef.route;
  }

  /**
   * Return a url for a view or the app's default url
   * @param route
   * @return {String}
   */
  getRouteView(route) {
    let view = '';
    this._views.forEach((viewDef, viewName) => {
      if (viewDef.route === route) {
        view = viewName;
      }
    });

    return view;
  }

  /**

   * @param viewId
   * @param params
   * @return {*}
   */
  getViewPath(viewId, params = null) {
    const route = this.getViewRoute(viewId);
    return this.getRoutePath(route, params);
  }

  /**
   * Get a view from a path (full url or path)
   * @param path
   * @return {*|String}
   */
  getPathView(path) {
    const absolutePath = path.replace(this._baseUrl, '');
    const route = this._router.getPathRoute(absolutePath);
    return this.getRouteView(route);
  }

  /**
   *
   * @param route
   * @param params
   * @return {*}
   */
  getRoutePath(route, params = null) {
    return this._router.getRoutePath(route, params || this.getState());
  }

  getRoutes() {
    return this._router.routes;
  }

  getConfig() {
    return this.config;
  }

  get handler() {
    return this._handler;
  }

  /**
   * - Registers routes
   * - Opens the view from the given startview, the url of the window or from the given
   * startView in the config configuration.
   *
   * @throws Error
   */
  init() {
    // set app's controlNode if not set
    if (this.config.controlNode == null) {
      this.config.controlNode = document.getElementById('controlNode');
    }
    // register all views and subviews
    this.registerViews();
    if (!this.config.startView) {
      throw Error('Application has not provided a start view');
    } else {
      const viewDef = this.getViewDef(this.config.startView);
      this._router.setDefaultRoute(viewDef.route);
    }

    // reset router's state
    this._router.resetState();

    // create controllers class
    if (this.config.controlClass) {
      this._controller = this.createSiteController(this.config.controlClass, this.config.controlNode);

      // set central view node if not set already
      if (this.config.viewsNode == null) {
        this.config.viewsNode = document.getElementById('viewsNode');
      }
    }
  }

  registerViews() {
    this._registerViews();
    this._unRegisterDisabledViews();
    this.validateConfiguration();
  }

  _validateViews() {
    // TODO add an error message
    const hasRoute = view => 'route' in view;
    const parentExists = (view, views) => ('parent' in view ? views.has(view.parent) : true);
    const moduleExists = (view, views, modules) => ('module' in view ? modules.has(view.module) : true);

    const validationFuncs = [
      hasRoute,
      parentExists,
      moduleExists,
    ];

    this._views.forEach((viewDef, viewName) => {
      const allValid = validationFuncs.every(func => func(viewDef, this._views));
      if (!allValid) {
        throw new ConfigError(`${viewName} view is not configured correctly`);
      }
    });
  }

  /**
   * Validate the structure of the view def
   * @param viewDef
   * @private
   * @return {true|false}
   */
  // eslint-disable-next-line class-methods-use-this
  _validateViewDef() {
  }

  /**
   * Adds view and routes
   * @param viewDef
   * @private
   */
  _registerViewAndRoute(viewDef) {
    this._views.set(viewDef.name, viewDef);
    this._router.add(viewDef.route, viewDef);
  }

  _registerViews() {
    // register all (sub-)views and their routes
    if (this.config.views) {
      this.config.views.forEach((view) => {
        this._registerViewAndRoute(view);
      });
    }
  }

  /**
   * Called just after registering views.
   * Override if applications needs to unregister some views
   *
   * @private
   */
  // eslint-disable-next-line class-methods-use-this
  _unRegisterDisabledViews() {
  }

  /**
   * Navigate the requested path
   * @private
   */
  load() {
    if (typeof this.config.start === 'function') {
      this.config.start.call(this, this);
    } else {
      this._navigatePath(document.location.pathname);
    }
  }

  /**
   * Use the router to navigate to a given path or a fallback path
   *
   * @param path
   * @private
   */
  _navigatePath(path = null) {
    if (path) {
      this._router.navigate(path);
    } else {
      this._router.navigate(this._getFallbackPath());
    }
  }

  /**
   * Get a start view path if exists or a default path
   *
   * @return {String}
   * @private
   */
  _getFallbackPath() {
    return this.getViewPath(this.config.startView, this.config.startParams);
  }

  /**
   * Renders a view
   *
   * @param {String} view the name of the view to switch to.
   * @param {Object} params
   * @param {Function} callback will be called after the view have been initialized,
   * @param {Boolean} ignoreSpaHandler set to true when render() is called from the app
   */
  render(view, params, callback = null, ignoreSpaHandler = true) {
    this._ignoreSpaHandler = ignoreSpaHandler;
    this._render(view, params, callback);
  }

  //= ==================================================
  // Methods to override in subclasses
  //= ==================================================
  /**
   * Create a view node as a child of this.config.viewsNode
   *
   *
   * @param ViewClass
   * @param viewDef
   * @return {*}
   */
  createView(viewDef) {
    const { class: ViewClass } = viewDef;
    if (viewDef.node == null) {
      // this.config.viewsNode should be a DOM node (?)
      viewDef.node = document.createElement('div');
      viewDef.node.setAttribute('class', 'spaView');
      domNodeHide(viewDef.node);
      this.config.viewsNode.appendChild(viewDef.node);
    }
    viewDef.constructorParams = viewDef.constructorParams || {};
    Object.assign(viewDef.constructorParams, { _siteManager: this });
    const view = new ViewClass(viewDef.constructorParams, viewDef.node);
    if (view.startup) view.startup();
    if (view.domNode) { // In case a dijit uses a template and creates a new node.
      viewDef.node = view.domNode;
      domNodeHide(viewDef.node);
    }
    return view;
  }

  createSiteController(SiteControllerClass, node) {
    const params = Object.assign({}, { site: this }, this.config.controllerConstructorParams);
    return new SiteControllerClass(params, node);
  }

  getSiteConroller() {
    return this._controller;
  }

  //= ==================================================
  // Public hooks
  //= ==================================================


  /**
   * Called after views are registered
   * @throws ConfigError
   */
  // eslint-disable-next-line class-methods-use-this
  validateConfiguration() {
  }

  /**
   * Read the config from files and store in memory
   * @param config
   * @private
   */
  _setConfig(config) {
    this.config = {};
    const config2 = config;
    const keys = ['baseUrl', 'startView', 'signinView', 'permissionView', 'pathIgnore', 'startParams', 'start',
      'viewsNode', 'views', 'hierarchies', 'controlNode', 'controlClass', 'controlConstructorParams', 'modules',
      'sidebar'];
    for (let i = 0; i < keys.length; i++) {
      this.config[keys[i]] = config2[keys[i]] || config[keys[i]];
    }
    this.config.views = this.config.views || [];
    this._baseUrl = this.config.baseUrl || '';
  }

  /**
   * Push the view to be rendered info into a queue and call the function to process the queue
   *
   * @param view
   * @param params
   * @param callback
   * @private
   */
  _render(view, params = {}, callback = null) {
    this._queue.push({ view, params, callback });

    if (this._queue.length === 1) {
      this._process();
    }
  }

  /**
   * The core engine of SPA.
   *  - Handles the viewObjects
   *  - Shows the view
   *  - Calls before/after viewChange functions
   *  - Publishes 'spa.beforeViewChange', 'spa.afterViewChange', 'spa.viewLoaded' for each view load
   * @private
   */
  _process() {
    __spaViewLoaded = false;
    // const state = this.getState();
    this._switchingToView = this._queue[0].view;
    this._switchingToParams = this._queue[0].params;

    this.updateViewParams(this._switchingToView, this._switchingToParams, true);

    const viewDef = this.getViewDef(this._switchingToView);

    PubSub.publishSync('spa.beforeViewChange', {
      switchingToView: this._switchingToView,
      switchingToParams: this._switchingToParams,
    });

    // Close current view first
    if (this._currentView !== '' && this._currentView !== this._switchingToParams) {
      const currentViewDef = this.getViewDef(this._currentView);
      domNodeHide(currentViewDef.node); // hide view from screen
      this._viewsObjects.delete(this._currentView); // delete view from memory
    }

    const showView = () => {
      const canShowPromise = this.canShowView(viewDef.instance, this._queue[0].params);
      canShowPromise.then((canShow) => {
        const viewName = this._queue[0].view;
        if (canShow) {
          const viewInstance = viewDef.instance;
          if (viewInstance.show) {
            viewInstance.show(this._queue[0]);
          }
          domNodeShow(viewDef.node);

          if (this._ignoreSpaHandler) {
            const path = this.getRoutePath(viewDef.route, this._switchingToParams);
            this._router.navigate(path);
          }

          this._currentView = viewDef.name;
          this.updateViewParams(this._currentView, this._switchingToParams);
          delete this._switchingToView;
          delete this._switchingToParams;

          PubSub.publishSync('spa.afterViewChange', {
            view: this._queue[0].view,
            switchingToParams: this._queue[0],
          });

          if (this._queue[0].callback != null) {
            this._queue[0].callback(viewInstance);
          }

          this._queue.splice(0, 1);
        }

        if (this._queue.length > 1) {
          this.updateStateParams({
            nextView: this._queue[0].view,
            nextViewParams: this._queue[0].params,
          });
          this._queue.splice(0, 1);
        }

        if (this._queue.length > 0) {
          this._process();
        } else {
          PubSub.publish('spa.viewLoaded', viewName); // TODO does this need to be publishSync?
          this._ignoreSpaHandler = false;
          __spaViewLoaded = true;
        }
      });
    };

    const loadAndShowView = () => {
      const viewPromise = this.getViewObject(this._switchingToView);
      viewPromise.then(showView.bind(this));
    };

    // TODO @valentino perhaps at this stage the readyState is always complete|loaded
    if (document.readyState === 'complete'
      || document.readyState === 'loaded'
      || document.readyState === 'interactive') {
      loadAndShowView();
    } else {
      document.addEventListener('DOMContentLoaded', loadAndShowView);
    }
  }

  /**
   * Get the object for a view
   *
   * @param {String|Object} view, view name or view definition
   * @return {Promise}
   */
  getViewObject(view) {
    const viewDef = typeof view === 'object' ? view : this.getViewDef(view);
    return this._getViewObject(viewDef);
  }

  /**
   * Require the class handler for a view definition and save it in the viewDef.instancePromise
   *
   * @param viewDef
   * @return {Promise}
   * @private
   */
  _getViewObject(viewDef) {
    if (!viewDef.instancePromise) {
      viewDef.instancePromise = new Promise((resolve, reject) => {
        if (viewDef.class == null) {
          reject();
          throw Error('No handler (class) has been provided for this view');
        } else {
          viewDef.instance = this.createView(viewDef);
          this._viewsObjects.set(viewDef.name, viewDef.instance);
          resolve(viewDef.instance);
        }
      });
    }

    return viewDef.instancePromise;
  }
}
