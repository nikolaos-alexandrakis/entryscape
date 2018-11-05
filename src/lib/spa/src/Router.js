/**
 * Terminology
 * path - a relative materialized route
 * route - a special expression to model abstract path
 * routeExp - a regular expression to express a route
 *
 * Route schema:
 *  - always start with a '/', e.g /catalog
 *  - mandatory params start with ':', e.g /catalog/:context
 *  - optional params start with '?', e.g /catalog/:context/dataset/?dataset
 *
 *  NOTE: this does not handle ambiguous routes
 *
 */
export default class Router {
  /**
   * Maps a route to handler, e.g viewDef
   */
  routes = new Map();
  /**
   * Maps a regular expression to a route
   */
  routesExp = new Map();
  /**
   * An array representation of routesExp, to looping/search
   */
  routesExpArray = [];
  /**
   * The root of the paths
   */
  root = '/';
  /**
   * The default route of the app
   */
  defaultRoute = null;
  /**
   *
   */
  queryParams = null;

  /**
   * Reset the history.state (minus the query params) and define a custom history.pushState
   * function on init
   *
   *  @param queryParams
   */
  constructor(queryParams) {
    this.queryParams = queryParams;
    this.resetState();
    this._monkeyPatchHistory();
  }

  /**
   * Overrides the default history.pushState. Call a history.onpushstate function after the
   * original history.pushState call.
   *
   * history.onpushstate should be defined in
   *
   * @private
   */
  _monkeyPatchHistory() {
    const pushState = window.history.pushState;
    window.history.pushState = function (state, title, url) {
      const ret = pushState.apply(window.history, arguments);
      if (typeof window.history.onpushstate === 'function') {
        window.history.onpushstate({stateParams: state, title, url});
      }
      return ret;
    };
  }

  /**
   * Add a route and an associated handler
   *
   * @param route
   * @param handler
   * @return {null}
   */
  add(route, handler) {
    this.routes.set(route, handler);
    const routeExp = this.getRouteExp(route);

    this.routesExp.set(routeExp, route);
    this.routesExpArray = Array.from(this.routesExp);
    return this;
  }

  /**
   * Remove a route
   * This funciton is a mess because the key of the map routesExp is a RegExp object
   *
   * @param route
   * @return {null}
   */
  remove(route) {
    const routeRegExp = this.getRouteExp(route);

    // check if route reg exp is registered
    const toRemoveRegExp = this.routesExpArray.find(exp => routeRegExp.source === exp.source);

    this.routes.delete(route);
    this.routesExp.delete(toRemoveRegExp);
    this.routesExpArray = Array.from(this.routesExp);
    return this;
  }

  /**
   * Get the regex for a route. If no route is passed, RegExp('.^') will be returned
   *
   * @param route
   * @return {RegExp}
   */
  getRouteExp(route) {
    if (route) {
      const parts = route.split('/');
      const re = [];

      parts.forEach((part) => {
        let regex = part;
        if (part.includes(':')) {
          regex = '\\w+';
        } else if (part.includes('?')) {
          regex = '?\\w*';
        }

        re.push(regex);
      });

      const joinedParts = re.join('/'); // joined regex
      return new RegExp(`^${joinedParts}/?$`);
    }

    return new RegExp('.^');
  }

  /**
   * @param route
   * @return {Object|null}
   */
  getRouteHandler(route) {
    return this.routes.get(route) || null;
  }

  /**
   * Given a route and some param, get the materialized path
   *
   * @param route
   * @param params
   * @return {String}
   */
  getRoutePath(route, params = {}) {
    if (this.routes.has(route)) {
      const path = [];
      const parts = route.split('/');

      try {
        parts.forEach((part) => {
          if (part.includes(':')) {
            const neededParam = part.split(':')[1];
            if (params.hasOwnProperty(neededParam)) {
              path.push(params[neededParam]);
            } else {
              Error('Route not configured correctly or not sufficient arguments given');
            }
          } else if (part.includes('?')) {
            const neededParam = part.split('?')[1];
            if (neededParam) {
              path.push(params[neededParam]);
            }
          } else {
            path.push(part);
          }
        });
      } catch (err) {
        console.log(err);
      }
      return path.join('/');
    }

    return this.root;
  }

  /**
   * Get the params from a materialized path w.r.t a route
   *
   * @param {String} path
   * @param {String|null} route
   */
  extractPathParams(path, route = null) {
    const cleanPath = this.getCleanPath(path);
    const pathRoute = route || this.getPathRoute(cleanPath);
    const pathParts = cleanPath.split('/');
    const routeParts = pathRoute.split('/');

    const params = {};
    routeParts.forEach((routePart, idx) => {
      if (routePart.match(/^[:?]/)) {
        if (idx < pathParts.length) {
          const stateParamName = routePart.split(/[:?]/)[1];
          const stateParamValue = pathParts[idx];

          if (stateParamValue) {
            params[stateParamName] = stateParamValue;
          }
        }
      }
    });

    return params;
  }

  /**
   * Get a route from a path
   *
   * @param path
   * @return {String}
   */
  getPathRoute(path) {
    const cleanPath = this.getCleanPath(path);
    // first, check if path is a route
    if (cleanPath === this.root) {
      return this.defaultRoute;
    } else if (this.routes.has(cleanPath)) {
      return this.routes.get(cleanPath).route;
    }

    const routeEl = this.routesExpArray.find(el => el[0].test(cleanPath));

    if (routeEl && routeEl.length > 0) {
      return routeEl[1];
    }

    return this.defaultRoute;
  }

  setDefaultRoute(route) {
    this.defaultRoute = route;
  }

  getDefaultRoute() {
    return this.defaultRoute;
  }

  getRoutes() {
    return this.routes;
  }

  flush() {
    this.routes = new Map();
    return this;
  }

  /**
   * @param route
   * @return {boolean}
   */
  hasRoute(route) {
    return this.routes.has(route);
  }

  /**
   * Commits a new entry to the history.state
   * @param path {String}
   * @param state
   * @return {navigate}
   */
  navigate(path) {
    const route = this.getPathRoute(path);
    history.pushState(this.getState(), null, route ? path + this.queryParams : this.root);
  }

  /**
   * Merges a given object with a copy of history.state to history.state
   * @param obj e.g { context: 5 }
   */
  updateStateParams(obj) {
    history.replaceState(obj, '', this.getCurrentPathname());
  }


  /**
   * @return {*}
   */
  getState() {
    return Object.assign({}, history.state);
  }


  /**
   * @return {*}
   */
  resetState() {
    history.replaceState({}, null, this.getCurrentPathname());
  }

  /**
   * Return the part before the '?' of a path
   * @param path
   */
  getCleanPath(path) {
    return this.queryParams ? path.split('?')[0] : path;
  }

  /**
   * Get the current document.location.pathname with/out queryParams
   *
   * @param includeQueryParams
   * @return {*}
   */
  getCurrentPathname(includeQueryParams = true) {
    if (includeQueryParams) {
      return document.location.pathname + this.queryParams;
    }

    return document.location.pathname;
  }
};
