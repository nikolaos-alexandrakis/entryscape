import jquery from 'jquery';
import PubSub from 'pubsub-js';

/**
 * Returns closest <a> parent (including the node) for a node
 *
 * @param {HTMLElement} node
 * @return {HTMLAnchorElement|null}
 */
const getClosestLink = (node) => {
  const closestLinks = jquery(node).closest('a');
  return closestLinks.length > 0 ? closestLinks[0] : null;
};

/**
 * Open an external link to a new window
 *
 * @param {string} href
 * @param {boolean} [blank=true]
 */
const openExternalLink = (href, blank = true) => {
  window.open(href, blank ? '_blank' : '');
};

export default class Handler {
  /**
   *  A regex to test any link against to check if link is internal or external
   */
  hostRegExp = null;
  /**
   *  An array of regex that are matched by hostRegExp but should still not be treated as
   *  navigational, e.g https://baseuri/store/x/resource/y
   */
  noActionLinkRegExp = [];
  commonURIProtocols = ['http:', 'https:', 'ftp:', 'ftps:', 'mailto:'];

  /**
   * If this class is set on an a element, the click is not handled by spa and the
   * browser will follow it in the default way.
   */
  spaExplicitLinkClass = 'spaExplicitLink';
  queryParams = null;

  constructor(queryParams, site) {
    this.site = site;
    this.hostRegExp = new RegExp(`//${location.host}($|/)`);
    this.noActionLinkRegExp = [
      new RegExp(`//${location.host}/store`),
    ]; // TODO get this from local.js and pass to spa/Site and then here
    this.queryParams = queryParams;
    this._initHandlers();
  }

  _initHandlers() {
    this._pushStateHandler();
    this._popStateHandler();
  }

  /**
   * Handle all clicks in the app.
   *
   * Ignore handling if:
   *   - A special variable this.site_ignoreSpaHandler is set to true (cases when the app itself
   *   'opens' a view). .render(view, params)
   *   - The click occurred in an element that is not or has not an <a> parent
   *
   * Opens external href into a new window
   *
   * @param e
   * @return {boolean}
   */
  clickHandler(e) {
    if (!this.site._ignoreSpaHandler) {
      const closestLink = getClosestLink(e.target);
      const href = e.target.href || (closestLink ? closestLink.href : undefined);
      if (href) {
        if (closestLink && this.isExplicitActionLink(closestLink)) {
          return true;
        }
        // if this is an external link than open in new window
        if (this.isExternalLink(href)) {
          e.preventDefault();
          openExternalLink(href);
          return false;
        }

        if (this.isNoActionLink(href)) {
          e.preventDefault();
          return false;
        }

        e.preventDefault();
        e.stopPropagation(); // TODO redundant?
        history.pushState({}, e.target.textContent, href + this.queryParams);
      }
    }

    if (__spaViewLoaded) {
      if (this.site._ignoreSpaHandler) {
        this.site._ignoreSpaHandler = false;
      } else {
        const viewLoadedSub = PubSub.subscribe('spa.viewLoaded', () => {
          this.site._ignoreSpaHandler = false;
          PubSub.unsubscribe(viewLoadedSub);
        });
      }
    }

    return false;
  }

  /**
   * Define a onpushstate function as a custom override of history.pushState
   *
   * Called when history.pushState is called and renders a view
   * @private
   */
  _pushStateHandler() {
    history.onpushstate = (state) => {
      if (!this.site._ignoreSpaHandler) {
        // this.site._router.resetState();
        const path = state.url.replace(this.site._baseUrl, '');
        const view = this.site.getPathView(path);
        const params = this.site._router.extractPathParams(path);

        this.site._render(view, params);
      }
    };
  }

  /**
   * If there's already a state with an application view then use the spa's render
   * otherwise let the browser decide
   *
   * @private
   */
  _popStateHandler() {
    window.addEventListener('popstate', (event) => {
      const view = event.state.view;
      if (view) {
        const params = event.state[view];
        this.site._render(view, params);
      }
    });
  }


  /**
   * Check if a given url is internal but should not be considered as navigational
   *
   * @param {String} href
   * @return {boolean}
   */
  isNoActionLink(href) {
    let isNoActionLink = false;

    if (this.commonURIProtocols.includes(document.location.protocol)) { // common protocol
      isNoActionLink = this.noActionLinkRegExp.some(regex => regex.test(href));
    }

    return isNoActionLink;
  }

  /**
   * Check if there is an explicit set class that tells SPA not to handle this click.
   */
  isExplicitActionLink(target) {
    return target.classList.contains(this.spaExplicitLinkClass);
  }


  /**
   * Check if a given url is external
   *
   * @param href
   * @return {boolean}
   */
  isExternalLink(href) {
    let isLocal = true;

    if (this.commonURIProtocols.includes(document.location.protocol)) { // common protocol
      isLocal = this.hostRegExp.test(href);
    }

    return !isLocal;
  }
}
