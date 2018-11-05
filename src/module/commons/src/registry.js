import PubSub from 'pubsub-js';

const registry = new Map(); // TODO @valentino is there a need for registryMapInital? e.g keep the first value of each key

/**
 * @returns {spa/Site}
 */
const getSiteManager = () => exports.get('siteManager');
/**
 * @returns {Object}
 */
const getSiteConfig = () => exports.get('siteConfig');
/**
 * @returns {store/EntryStore}
 */
const getEntryStore = () => exports.get('entrystore');
/**
 * @returns {store/Entry}
 */
const getEntry = () => exports.get('entry');

// App generic registry methods.
const exports = {
  set(key, obj, onlyOnce = false) {
    if (!onlyOnce || (onlyOnce && !registry.has(key))) {
      registry.set(key, obj);

      PubSub.publish(key, obj);
    }
  },
  get(key, /*callback*/) {
    const val = registry.get(key);
    // if (typeof callback === 'function') {
    //   if (typeof val !== 'undefined') {
    //     callback(val);
    //   } else {
    //     exports.onInit(key).then(callback); // TODO @valentino return this
    //   }
    // }
    return val;
  },
  /**
   *
   * @param key
   * @returns {Promise<any>}
   */
  onInit(key) {
    if (registry.has(key)) {
      return Promise.resolve(registry.get(key));
    }

    return new Promise(r => PubSub.subscribeOnce(key, (msg, obj) => r(obj)));
  },
  /**
   * Call the callback everytime the key is set. Note! the name onSet is more appropriate here, e.g it does not check
   * if the value has actually changed.
   * @param key
   * @param callback
   * @param lastChange if true then calls the callback with the value of key in registry
   * @param onlyOnce if true subscribes only once to a change
   * @returns {String} The pubsub subscription id
   */
  onChange(key, callback, lastChange = false, onlyOnce = false) {
    if (lastChange && registry.has(key)) {
      callback(registry.get(key));
    }
    return PubSub.subscribe(key, (msg, obj) => {
      callback(obj);
      if (onlyOnce) {
        PubSub.unsubscribe(msg)
      }
    });
  },
  onChangeOnce(key, callback) {
    return this.onChange(key, callback, false, true);
  },

  getSiteManager,
  getSiteConfig,
  getEntryStore,
  getEntry,
};

export default exports;
