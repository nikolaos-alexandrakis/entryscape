//import 'bootstrap-material-design/dist/js/material';
//import 'bootstrap-material-design/dist/js/ripples';
import jquery from 'jquery';
import PubSub from 'pubsub-js';
import util from './util';

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
  if (jquery.material) {
    jquery.material.ripples();
    jquery.material.input();
    jquery.material.checkbox();
    jquery.material.radio();
    jquery.material.togglebutton();
    // jquery.material.init();
  }
}, 500, { leading: false });


// run only once, when first view is loaded
const viewListener = PubSub.subscribe('spa.viewLoaded', () => {
  jquery.material.init();
  observeDOMAdditions(jquery('#viewsNode')[0], updateMaterial); // main content
  observeDOMAdditions(jquery('#entryscapeDialogs')[0], updateMaterial); // side dialogs
  PubSub.unsubscribe(viewListener);
});
