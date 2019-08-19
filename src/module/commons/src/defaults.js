import 'commons/bmd/all';
import config from 'config';
import { i18n } from 'esi18n';
import { get } from 'lodash-es';
import PubSub from 'pubsub-js';
import { namespaces } from 'rdfjson';
import { bundleLoader, ItemStore, renderingContext, utils } from 'rdforms';
import initSite from 'spa/init';
import { EntryStore, EntryStoreUtil } from 'store';
import superagent from 'superagent';
import dcatBundle from 'templates/dcat-ap/dcat-ap';
import geoDcatBundle from 'templates/dcat-ap/geodcat-ap';
import geoDcatVocabsBundle from 'templates/dcat-ap/geodcat-ap_vocabs';
import geoDcatPropsBundle from 'templates/dcat-ap/geodcat-ap_props';
import dcatPropsBundle from 'templates/dcat-ap/dcat-ap_props';
import dctermsBundle from 'templates/dcterms/dcterms';
import escBundle from 'templates/entryscape/esc';
import foafBundle from 'templates/foaf/foaf';
import odrsBundle from 'templates/odrs/odrs';
// default bundles
import skosBundle from 'templates/skos/skos';
import vcardBundle from 'templates/vcard/vcard';
import AcknowledgeDialog from './dialog/AcknowledgeDialog';
import AcknowledgeTextDialog from './dialog/AcknowledgeTextDialog';
import ConfirmDialog from './dialog/ConfirmDialog';
import OptionsDialog from './dialog/OptionsDialog';
import Progress from './dialog/Progress';
import AsyncHandler from './errors/AsyncHandler';
import RestrictionDialog from './errors/RestrictionDialog';
import registry from './registry';
import { getFallbackBundleUrls } from './util/bundleUtil';
import configUtil from './util/configUtil';
import { fixEoG } from './util/entryUtil';
import DOMUtil from './util/htmlUtil';
import Lookup from './types/Lookup';

const jsonp = require('superagent-jsonp');

/**
 * Adds the following to the registry:
 * entrystore      - an instance of store/EntryStore.
 * entry           - an instance of store/Entry, refers to the current entry in use
 * itemstore       - an instance of rdforms/template/ItemStore.
 * createEntry     - creates a named or link entry depending on config.entrystore.resourceBase
 * entrychooser    - specifying per property if entries are choosen in repository or per context
 * dialogs         - a module for showing confirm, progress and acknowledge dialogs.
 * namespaces      - the rdfjson/namespaces module.
 * localize        - returns a string based on the locale from e.g. {en: "Hello", sv: "Hej"}.
 * rdfutils        - a module for getting labels from entry instances.
 * defaultLocale   - the language (ISO-code) specified by the browser environment on page load.
 * locale          - the language chosen, one of the supported languages of EntryScape.
 * userInfo        - the current user information, see store/Auth#getUserInformation.
 * userEntry       - the entry for the current user (_guest entry when unauthorized)
 * userEntryInfo   - user information including also a firstName, lastName and a displayName.
 * authorizedUser  - the username (store/User#getName) for the current user, null for _guest.
 * siteManager     - the current spa/Site instance handling the various views.
 * context         - the current context (instance of store/Context).
 * entry           - the current entry (instance of store/Entry).
 * isAdmin         - true if the current user is the site administrator
 * inAdminGroup    - true if the user is in the site admin group
 * hasAdminRights  - true if the user is either site administrator or
 *                 - in the site administrator group
 * baseUrl         - The base URL of the application
 *
 *
 * In addition, if the config contains a googleAnalyticsID the google analytics is activated.
 *
 * @exports store/rest
 * @namespace
 */

/** @type {store/EntryStore} */
let es;

const init = {
  config() {
    config.get = get.bind(null, config);
  },
  entrystore() {
    es = new EntryStore((config.entrystore && config.entrystore.repository ? config.entrystore.repository : null));
    registry.set('entrystore', es);
    registry.set('entry', undefined);
    registry.set('entrystoreutil', new EntryStoreUtil(es));
  },
  namespaces() {
    // config.rdf section
    config.rdf = config.rdf || {};
    // Default registration of namespaces
    registry.set('namespaces', namespaces);
    if (config.rdf.namespaces) {
      namespaces.add(config.rdf.namespaces);
    }
    namespaces.add('store', 'http://entrystore.org/terms/');
  },
  entitytypes() {
    config.entitytypes = configUtil.objToArray(config.entitytypes);
    Lookup.init();
  },
  contexttypes() {
    config.contexttypes = configUtil.objToArray(config.contexttypes);
  },
  contentviewers() {
    config.contentviewers = configUtil.objToArray(config.contentviewers) || [];
    config.contentviewers.forEach((contentViewer, idx) => {
      import(
        /* webpackInclude: /.*View\.js$/ */
        /* webpackMode: "eager" */
        `./contentview/${contentViewer.class}.js`)
        .then((viewerClass) => {
          try {
            config.contentviewers[idx].class = viewerClass.default;
          } catch (e) {
            throw Error(`Could not load viewer ${contentViewer.class}`);
          }
        });
    });
  },
  dialogs() {
    const container = DOMUtil.create('div', { id: 'entryscape_dialogs', class: 'entryscape' }, document.body);
    renderingContext.setPopoverContainer(container);

    const confirmDialog = new ConfirmDialog();
    const acknowledgeDialog = new AcknowledgeDialog();
    const progress = new Progress();
    const acknowledgeTextDialog = new AcknowledgeTextDialog();
    const restrictionDialog = new RestrictionDialog();
    const optionsDialog = new OptionsDialog();
    registry.set('dialogs', {
      progress(promise) {
        return progress.show(promise);
      },
      acknowledge(message, okLabel, callback) {
        return acknowledgeDialog.show(message, okLabel, callback);
      },
      confirm(message, confirmLabel, rejectLabel, callback) {
        return confirmDialog.show(message, confirmLabel, rejectLabel, callback);
      },
      acknowledgeText(path, title, callback) {
        return acknowledgeTextDialog.show(path, title, callback);
      },
      restriction(path) {
        return restrictionDialog.show(path); // TODO @valentino there was no return here
      },
      options(message, options) {
        return optionsDialog.show(message, options);
      },
    });
  },
  itemstore: {
    async bundles() {
      const items = new ItemStore();
      const bundles = [];
      // load default bundles => need to be in the webpack bundle
      if (config.itemstore) {
        if (config.itemstore.defaultBundles) { // somehow register only what set on itemstore.defaultBundles
          bundles.push(skosBundle);
          bundles.push(dctermsBundle);
          bundles.push(foafBundle);
          bundles.push(vcardBundle);
          bundles.push(odrsBundle);
          bundles.push(dcatPropsBundle);
          bundles.push(dcatBundle);
          bundles.push(geoDcatVocabsBundle);
          bundles.push(geoDcatPropsBundle);
          bundles.push(geoDcatBundle);
          bundles.push(escBundle);
        }
        if (config.itemstore.bundles) {
          config.itemstore.bundles.forEach(id => bundles.push(getFallbackBundleUrls(id)));
        }
        await bundleLoader(items, bundles); // load the bundles
        registry.set('itemstore', items);
      }
    },
    languages() {
      if (config.itemstore) {
        if (config.itemstore.languages) {
          renderingContext.setLanguageList(config.itemstore.languages);
        }
      }
    },
    appendLanguages() {
      if (config.itemstore) {
        if (config.itemstore.appendLanguages) {
          const langs = renderingContext.getLanguageList();
          renderingContext.setLanguageList(langs.concat(config.itemstore.appendLanguages));
        }
      }
    },
    choosers() {
      if (config.itemstore && config.itemstore.choosers) {
        config.itemstore.choosers.forEach((chooserName) => {
          import(
            /* webpackInclude: /.*Chooser\.js$/ */
            /* webpackMode: "eager" */
            `./rdforms/choosers/${chooserName}.js`)
            .then((chooser) => {
              try {
                chooser.default.registerDefaults();
              } catch (e) {
                throw Error(`Could not load chooser ${chooserName}`);
              }
            });
        });
      }
    },
  },
  entrychooser() {
    if (config.entrychooser) {
      registry.set('entrychooser', config.entrychooser);
    }
  },
  rdfutils() {
    let labelProperties;
    let descriptionProperties;
    const rdfutils = {
      setLabelProperties(arr) {
        labelProperties = arr;
      },
      setDescriptionProperties(arr) {
        descriptionProperties = arr;
      },
      getLabel(eog, uri) {
        const { g, r } = fixEoG(eog, uri);
        return utils.getLocalizedValue(
          utils.getLocalizedMap(g, r, labelProperties)).value;
      },
      getLabelMap(eog, uri) {
        const { g, r } = fixEoG(eog, uri);
        return utils.getLocalizedMap(g, r, labelProperties);
      },
      getDescription(eog, uri) {
        const { g, r } = fixEoG(eog, uri);
        return utils.getLocalizedValue(
          utils.getLocalizedMap(g, r, descriptionProperties)).value;
      },
      getDescriptionMap(eog, uri) {
        const { g, r } = fixEoG(eog, uri);
        return utils.getLocalizedMap(g, r, descriptionProperties);
      },
    };

    if (config.rdf.labelProperties) {
      rdfutils.setLabelProperties(config.rdf.labelProperties);
    } else {
      rdfutils.setLabelProperties([
        'foaf:name',
        ['foaf:firstName', 'foaf:lastName'],
        ['foaf:givenName', 'foaf:familyName'],
        'vcard:fn',
        'skos:prefLabel',
        'dcterms:title',
        'dc:title',
        'rdfs:label',
        'skos:altLabel',
        'vcard:hasEmail',
      ]);
    }

    if (config.rdf.descriptionProperties) {
      rdfutils.setDescriptionProperties(config.rdf.descriptionProperties);
    } else {
      rdfutils.setDescriptionProperties([
        'http://purl.org/dc/terms/description',
      ]);
    }

    registry.set('rdfutils', rdfutils);
  },
  asyncHandler() {
    const async = new AsyncHandler();
    es.addAsyncListener((promise, callType) => {
      async.show(promise, callType);
    });
    registry.set('asynchandler', async);
  },
  nlsOverride() {
    // If there are NLS overrides, register them early.
    // if (config.locale.NLSOverridePath) {
    // } else
    if (typeof config.locale.NLSOverrides === 'object') {
      i18n.setOverrides(config.locale.NLSOverrides);
    }
  },
  locale() {
    registry.set('localize', lang2val => utils.getLocalizedValue(lang2val).value);

    // Fix defaultLocale and locale
    registry.set('defaultLocale', i18n.getLocale());
    registry.onChange('locale', (l) => {
      if (i18n.getLocale() !== l) {
        i18n.setLocale(l);
      }
    });

    registry.onChange('locale', () => {
      // Combining the current language, with accepted languages from the browser and finally the
      // languages supported by entryscape. The given order should be respected and no duplicates
      // allowed.
      const primary = new Set();
      primary.add(registry.get('locale'));
      const alo = registry.get('clientAcceptLanguages');
      /* eslint-disable no-confusing-arrow */
      if (alo) {
        Object.keys(alo).sort((l1, l2) => alo[l1] < alo[l2] ? 1 : -1).forEach(l => primary.add(l));
      }
      config.locale.supported.map(o => o.lang).forEach(l => primary.add(l));
      renderingContext.setPrimaryLanguageCodes(Array.from(primary));
    });
  },
  site() {
    const baseUrl = configUtil.getBaseUrl();
    registry.set('baseUrl', baseUrl);

    // convert site configs obj to arr
    registry.getSiteConfig().modules = configUtil.objToArray(registry.getSiteConfig().modules);
    registry.getSiteConfig().views = configUtil.objToArray(registry.getSiteConfig().views);
    if (registry.getSiteConfig().moduleList) {
      const name2module = {};
      registry.getSiteConfig().modules.forEach((m) => {
        name2module[m.name] = m;
      });
      registry.getSiteConfig().modules = registry.getSiteConfig().moduleList.map(mname => name2module[mname]);
    }

    // init site, set to registry and load the application by rendering the requested view
    const siteConfig = Object.assign({}, registry.get('siteConfig'), { baseUrl });
    const site = initSite(siteConfig);
    registry.set('siteManager', site);

    // Make sure the current context and entry are set in the registry
    PubSub.subscribe('spa.beforeViewChange', (msg, args) => {
      const { switchingToParams } = args;
      const { context, entry } = switchingToParams;
      if (context != null) {
        registry.set('context', es.getContextById(context));
        if (entry != null) {
          const uri = es.getEntryURI(context, entry);
          es.getEntry(uri).then(e => registry.set('entry', e));
        }
      } else {
        registry.set('context', null);
      }
    });

    site.load(); // load the application by navigating to the requested path/view

    registry.onChange('locale', () => {
      site.reRenderCurrentView();
    });
  },
  googleAnalytics() {
    if (typeof config.googleAnalyticsID !== 'undefined') {
      window.GoogleAnalyticsObject = 'ga';
      window.ga = function () {
        (window.ga.q = window.ga.q || []).push(arguments); // TODO don't use arguments, use spread
      };
      window.ga.l = 1 * new Date();
      window.ga('create', config.googleAnalyticsID, 'auto');
      window.ga('send', 'pageview', { page: location.pathname + location.search + location.hash });
      window.addEventListener('error', (err) => {
        const lineAndColumnInfo = err.colno ? ` line:${err.lineno}, column:${err.colno}` : ` line:${err.lineno}`;
        window.ga('send', 'event', 'JavaScript Error',
          err.message, `${err.filename + lineAndColumnInfo} -> ${navigator.userAgent}`, 0, true);
      });

      superagent.get('https://www.google-analytics.com/analytics.js');
    }
  },
  recaptcha() {
    if (typeof config.reCaptchaSiteKey !== 'undefined') {
      window.rcCallback = () => registry.set('recaptcha', grecaptcha);
      registry.set('addRecaptcha', (id, callback, expiredCallback) => {
        registry.onInit('recaptcha').then((rec) => {
          rec.render(id, {
            sitekey: config.reCaptchaSiteKey,
            callback,
            'expired-callback': expiredCallback,
          });
        });
      });
      superagent.get('https://www.google.com/recaptcha/api.js?onload=rcCallback&render=explicit')
        .use(
          jsonp({
            timeout: 1000000,
          }))
        .then((grecaptcha) => {
          registry.set('recaptcha', grecaptcha);
        });
    } else {
      registry.set('addRecaptcha', () => {
        console.error('Cannot add recaptcha since no site key is provided in config.reCaptchaSiteKey.');
      });
    }
  },
  user() {
    registry.onChange('userInfo', (userInfo) => {
      let bestlang;
      const newlang = userInfo.language == null ? registry.get('defaultLocale') : userInfo.language;
      for (let i = 0; i < config.locale.supported.length; i++) {
        const l = config.locale.supported[i].lang;
        if (newlang.indexOf(l) === 0) {
          if (bestlang == null || bestlang.length < l.length) {
            bestlang = l;
          }
        }
      }
      if (userInfo.clientAcceptLanguage) {
        registry.set('clientAcceptLanguages', userInfo.clientAcceptLanguage);
      }
      if (bestlang) {
        registry.set('locale', bestlang);
      } else {
        registry.set('locale', config.locale.fallback);
      }
    }, true);

    // Load userInfo from the start and listen to authorization changes.
    let f;
    const auth = es.getAuth();
    const updateUserInfo = (userInfo) => {
      registry.set('userInfo', userInfo);
      if (userInfo.id !== '_guest') {
        registry.set('authorizedUser', userInfo.user);
      } else {
        registry.set('authorizedUser', null);
      }
    };
    const updateUserEntry = userEntry => registry.set('userEntry', userEntry);
    if (config.entrystore && config.entrystore.authentification !== false) {
      auth.getUserInfo().then(f = (userInfo) => {
        updateUserInfo(userInfo);
        auth.getUserEntry().then(updateUserEntry);
      });
      auth.addAuthListener((topic, userinfo) => {
        f(userinfo);
      });
    }

    registry.set('verifyUser', () => {
      // Forces both userinfor and userEntry to be refreshed.
      auth.getUserEntry(true).then((userEntry) => {
        // Should return immediately since it is needed for loading the userEntry
        auth.getUserInfo(updateUserInfo);
        updateUserEntry(userEntry);
      });
    });

    registry.onChange('userEntry', (userEntry) => {
      const metadata = userEntry.getMetadata();
      const user = userEntry.getResource(true);
      const res = {
        lastName: metadata.findFirstValue(null, 'http://xmlns.com/foaf/0.1/familyName'),
        firstName: metadata.findFirstValue(null, 'http://xmlns.com/foaf/0.1/givenName'),
        displayName: user.getName(),
        user: user.getName(),
        homeContext: user.getHomeContext(),
        entryId: userEntry.getId(),
        language: user.getLanguage(),
      };
      if (res.firstName) {
        res.displayName = res.firstName;
        if (res.lastName) {
          res.displayName += ` ${res.lastName}`;
        }
      }

      const isAdmin = userEntry.getId() === '_admin';
      const inAdminGroup = userEntry.getParentGroups()
        .indexOf(userEntry.getEntryStore().getEntryURI('_principals', '_admins')) >= 0;
      registry.set('isAdmin', isAdmin);
      registry.set('inAdminGroup', inAdminGroup);
      registry.set('hasAdminRights', isAdmin || inAdminGroup);
      registry.set('userEntryInfo', res);
      if (registry.get('locale') !== res.language && res.language != null) {
        registry.set('locale', res.language);
      }
    }, true);
  },
  setGetGroupWithHomeContext() {
    registry.set('getGroupWithHomeContext', context => new Promise((resolve) => {
      const store = registry.get('entrystore');
      let foundOne = false;

      context.getEntry().then((contextEntry) => {
        const contextACL = contextEntry.getEntryInfo().getACL(true);
        contextACL.rwrite.forEach((principalId) => {
          if (foundOne) {
            return;
          }
          const puri = store.getEntryURI('_principals', principalId);
          store.getEntry(puri, null)
            .then(e => (e.isGroup() ? e.getResource() : null))
            .then((groupResource) => {
              if (!foundOne && groupResource != null &&
                groupResource.getHomeContext() === context.getId()) {
                groupResource.getEntry().then((groupEntry) => {
                  resolve(groupEntry);
                });
                foundOne = true;
              }
            });
        });
      });
    }));
  },
  app() {
    init.dialogs();
    Promise.all([registry.onInit('locale'), registry.onInit('hasAdminRights')])
      .then(init.site);
    init.googleAnalytics();
  },
};


// TODO @valentino HACK: in order to have some registry items, e.g registry.get('namespaces'),
// available at 'dojo/declare' class construction those items need to be set first. The following ensure that.
init.config();
init.entrystore();
init.namespaces();
init.entitytypes();
init.contexttypes();
init.contentviewers();
init.entrychooser();
init.rdfutils();
init.asyncHandler();

export default async () => {
  init.nlsOverride();
  await init.itemstore.bundles();
  init.itemstore.appendLanguages();
  init.itemstore.languages();
  init.itemstore.choosers();
  init.locale();
  init.recaptcha();
  init.user();
  init.setGetGroupWithHomeContext();

  // initApp
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init.app);
  } else {
    init.app();
  }
};
