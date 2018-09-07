import merge from 'entryscape-commons/merge';
import adminConfig from 'entryscape-admin/config/adminConfig';
import catalogConfig from 'entryscape-catalog/config/catalogConfig';
import termsConfig from 'entryscape-terms/config/termsConfig';
import workbenchConfig from 'entryscape-workbench/config/workbenchConfig';
import i18n from 'esi18n';

const config = merge(adminConfig, catalogConfig, termsConfig, workbenchConfig, {
  theme: {
    appName: 'EntryScape',
    oneRowNavbar: false,
    localTheme: false,
    default: {
      appName: 'EntryScape',
      logo: 'https://static.entryscape.com/assets/entryscape.svg',
      themePath: 'entryscape-commons/theme/',
    },
    assetsPath: 'https://static.entryscape.com/assets/',
  },
  locale: {
    fallback: 'en',
    supported: [
      {
        lang: 'de',
        flag: 'de',
        label: 'Deutsch',
        labelEn: 'German',
        shortDatePattern: 'dd. MMM',
      },
      {
        lang: 'en',
        flag: 'gb',
        label: 'English',
        labelEn: 'English',
        shortDatePattern: 'MMM dd',
      },
      {
        lang: 'sv',
        flag: 'se',
        label: 'Svenska',
        labelEn: 'Swedish',
        shortDatePattern: 'dd MMM',
      },
      // {lang: "nb", flag: "no", label: "Norsk", labelEn: "Norwegian", shortDatePattern:"dd.MMM"}
    ],
  },
  itemstore: {
    '!bundles': [
      'templates/skos/skos',
      'templates/dcterms/dcterms',
      'templates/foaf/foaf',
      'templates/vcard/vcard',
      'templates/odrs/odrs',
      'templates/dcat-ap/dcat-ap_props',
      'templates/dcat-ap/dcat-ap',
      'templates/entryscape/esc',
    ],
  },
  site: {
    siteClass: 'entryscape-commons/nav/Site', // mandatory
    controlClass: 'entryscape-commons/nav/Layout', // mandatory
    startView: 'start', // mandatory
    signinView: 'signin',
    permissionView: 'permission',
    sidebar: {wide: false, always: true, replaceTabs: true},
    views: {
      signin: {
        name: 'signin',
        title: {en: 'Sign in/out', sv: 'Logga in/ut', da: 'Login/ud', de: 'An-/Abmelden'},
        class: 'entryscape-commons/nav/Signin',
        constructorParams: {nextView: 'start'},
        route: '/signin',
      },
      permission: {
        name: 'permission',
        title: {
          en: 'You do not have permission to view this page',
          sv: 'Logga in/ut',
          da: 'Login/ud',
          de: 'An-/Abmelden',
        },
        class: 'entryscape-commons/nav/Permission',
        route: '/permission',
      },
      start: {
        name: 'start',
        class: 'entryscape-commons/nav/Start',
        title: {en: 'Start', sv: 'Start', da: 'Start', de: 'Start'},
        route: '/start',
      },
    },
    modules: {
      search: {
        title: {en: 'Search'},
        productName: 'Search',
        faClass: 'search',
        startView: 'catalog__search',
        public: true,
      },
    },
    moduleList: ['catalog', 'terms', 'workbench', 'search', 'admin'],
  },
}, __entryscape_config, window.__entryscape_config_dev || {});

let bestlang;
for (let i = 0; i < config.locale.supported.length; i++) {
  const l = config.locale.supported[i].lang;
  if (i18n.getLocale().indexOf(l) === 0) {
    if (bestlang == null || bestlang.length < l.length) {
      bestlang = l;
    }
  }
}

i18n.setLocale(bestlang || config.locale.fallback);
export default config;
