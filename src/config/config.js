import merge from 'commons/merge';
import adminConfig from 'admin/config/config';
import catalogConfig from 'catalog/config/config';
import workbenchConfig from 'workbench/config/config';
import termsConfig from 'terms/config/config';
import {i18n} from 'esi18n';

const config = merge(adminConfig, catalogConfig, termsConfig, workbenchConfig, {
  entryscape: {
    static: {
      url: 'https://static.entryscape.com/',
      app: 'suite',
      version: 'latest',
    }
  },
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
    'defaultBundles': [
      'skos',
      'dcterms',
      'foaf',
      'vcard',
      'odrs',
      'dcat-ap_props',
      'dcat-ap',
      'esc',
    ],
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
