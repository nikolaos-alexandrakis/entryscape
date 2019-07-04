import jquery from 'jquery';
import PubSub from 'pubsub-js';
import util from './util';
import './overrides.scss';

const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

/**
 * Observer DOM changes (only additions) and call the callback
 * @param obj
 * @param callback
 */
const observeDOMAdditions = (obj, callback) => {
  // define a new observer
  const obs = new MutationObserver(callback);
  // have the observer observe foo for changes in children

  obs.observe(obj, {
    childList: true,
    subtree: true,
  });
};

// initializeMaterial is not called more than once per X ms
const updateMaterial = util.throttle(() => {
  jquery('[data-toggle="popover"]').popover();
}, 500, { leading: false });


// run only once, when first view is loaded
const viewListener = PubSub.subscribe('spa.viewLoaded', () => {
  jquery('body').bootstrapMaterialDesign();
  window.$ = jquery;
  observeDOMAdditions(jquery('#viewsNode')[0], updateMaterial); // main content
  observeDOMAdditions(jquery('#entryscapeDialogs')[0], updateMaterial); // side dialogs
  PubSub.unsubscribe(viewListener);
});
