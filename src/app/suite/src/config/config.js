import adminConfig from 'admin/config/config';
import catalogConfig from 'catalog/config/config';
import merge from 'commons/merge';
import { i18n } from 'esi18n';
import termsConfig from 'terms/config/config';
import workbenchConfig from 'workbench/config/config';

const STATIC = {
  URL: 'https://static.entryscape.com/',
  APP: 'suite',
  VERSION: 'latest',
};

const ASSETS_URL = `${STATIC.URL}${STATIC.APP}/${STATIC.VERSION}/assets/`;
const LOGO_SVG_URL = `${ASSETS_URL}entryscape.svg`;

const config = merge(adminConfig, catalogConfig, termsConfig, workbenchConfig, {
  entryscape: {
    static: {
      url: STATIC.URL,
      app: STATIC.APP,
      version: STATIC.VERSION,
    },
  },
  theme: {
    appName: 'EntryScape',
    oneRowNavbar: false,
    localTheme: false,
    localAssets: false,
    default: {
      appName: 'EntryScape',
      logo: LOGO_SVG_URL,
      themePath: ASSETS_URL,
      assetsPath: ASSETS_URL,
    },
  },
  locale: {
    fallback: 'en',
    supported: [
      {
        lang: 'de',
        flag: 'de',
        label: 'Deutsch',
        labelEn: 'German',
        shortDatePattern: 'DD. MMM',
      },
      {
        lang: 'en',
        flag: 'gb',
        label: 'English',
        labelEn: 'English',
        shortDatePattern: 'MMM DD',
      },
      {
        lang: 'sv',
        flag: 'se',
        label: 'Svenska',
        labelEn: 'Swedish',
        shortDatePattern: 'DD MMM',
      },
      // {lang: "nb", flag: "no", label: "Norsk", labelEn: "Norwegian", shortDatePattern:"dd.MMM"}
    ],
  },
  itemstore: {
    defaultBundles: [
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

if (bestlang) {
  i18n.setLocale(bestlang);
}
else {
  i18n.setLocale(config.locale.fallback);
}

export default config;
