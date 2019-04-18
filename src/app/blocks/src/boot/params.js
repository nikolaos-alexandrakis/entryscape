import config from 'blocks/config/config';
import PubSub from 'pubsub-js';
import registry from 'commons/registry';
import { queryToObject, objectToQuery } from 'commons/util/browserUtil';

if (!config.urlParams.entry && !config.urlParams.context) {
  const es = registry.getEntryStore();
  if (window.location.href.indexOf(es.getBaseURI()) === 0) {
    config.urlParams.entry = es.getEntryId(window.location.href);
    config.urlParams.context = es.getContextId(window.location.href);
  }
}

registry.set('urlParams', config.urlParams);
const prefix = config.hashParamsPrefix || 'esc_';
const _getFragment = function (params, alwaysFragment) {
  const p = {};
  Object.keys(params).forEach((key) => {
    p[prefix + key] = params[key];
  });
  const query = objectToQuery(p);
  return query.length !== 0 ? `#${query}` : (alwaysFragment ? '#noscroll' : '');
/*        var args = [];
        for (var key in params) if (params.hasOwnProperty(key)) {
            args.push(prefix+key+"="+params[key]);
        }
        return args.length > 0 ?"#"+args.join("&") : (alwaysFragment ? "#" : ""); */
};

const urlParams = {
  getLink(base, params) {
    return base + _getFragment(params);
  },
  setLocation(base, params) {
    window.location.href = base + _getFragment(params, base === '');
  },
  getUrlParams() {
    return registry.get('urlParams');
  },
  /**
   *  Listener will be called with initial value as well as after subsequent changes.
   */
  addListener(listener) {
    registry.onChange('urlParams', listener, true);
  },
  onInit(listener) {
    registry.onInit('urlParams').then(listener);
  },
};

PubSub.subscribe('/dojo/hashchange', (hashstr) => {
  const prefix = config.hashParamsPrefix || 'esc_';
  const hasho = {};
  const hash = queryToObject(hashstr);
  for (const key in hash) {
    if (hash.hasOwnProperty(key)) {
      if (key.indexOf(prefix) === 0) {
        hasho[key.substr(prefix.length)] = hash[key];
      }
    }
  }
  registry.set('urlParams', hasho);
});

export default urlParams;
