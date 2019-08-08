import PubSub from 'pubsub-js';
import Site from './Site';
import Handler from './Handler';
import Router from './Router';

let site = null;

// TODO consider dynamic importing of these three classes
const createSite = (siteConf) => {
  const { siteClass, routerClass, handlerClass } = siteConf;
  const SiteClass = siteClass || Site;
  const RouterClass = routerClass || Router;
  const HandlerClass = handlerClass || Handler;

  // Create the site object to be used throughout the application
  return new SiteClass({
    config: siteConf,
    router: RouterClass,
    handler: HandlerClass,
    queryParams: window.queryParams || '',
  });
};

/**
 * Initializes a singleton site for this app
 *
 * @param siteConf A configuration object containing views/routes/handlers for the whole application
 * @returns {*}
 */
const initSite = (siteConf) => {
  if (site === null) {
    site = createSite(siteConf);
    site.init(); // init routes/views

    // Assign a generic click handler to the Handler class after the first time that the view has loaded
    PubSub.subscribeOnce('spa.viewLoaded', () => {
      document.addEventListener('click', site.handler.clickHandler.bind(site.handler));
    });
  }
  return site;
};

export default initSite;
