/* eslint-disable max-len */
import adminConfig from 'admin/config/config';
import catalogConfig from 'catalog/config/config';
import merge from 'commons/merge';
import workbenchConfig from 'workbench/config/config';

const isDev = __entryscape_config.entryscape.static.version === 'latest';
const STATIC = {
  URL: `https://static.${!isDev ? 'cdn.' : ''}entryscape.com/`, // always with a trailing slash
  APP: 'registry',
  VERSION: 'latest',
};
const ASSETS_URL = __entryscape_config.entryscape.localBuild ? '/dist/assets/' : `${STATIC.URL}${STATIC.APP}/${STATIC.VERSION}/assets/`;
const LOGO_SVG_URL = `${ASSETS_URL}entryscape.svg`;

const config = merge(adminConfig, catalogConfig, workbenchConfig, {
  entryscape: {
    static: {
      url: STATIC.URL,
      app: STATIC.APP,
      version: STATIC.VERSION,
    },
  },
  theme: {
    appName: 'Registry',
    showModuleNameInHeader: true,
    localTheme: false,
    localAssets: false,
    default: {
      appName: 'Registry',
      logo: LOGO_SVG_URL,
      themePath: ASSETS_URL,
      assetsPath: ASSETS_URL,
    },
    startBanner: {
      header: {
        en: 'EntryScape Registry',
        sv: 'EntryScape Registry',
        de: 'EntryScape Registry',
      },
      text: {
        en: 'EntryScape Registry is a supplement to an open data portal. Here are tools that are helpful for organizations that want to make available its open data.',
        sv: 'EntryScape Registry är ett komplement till en öppen dataportal. Här finns verktyg som är till hjälp för organisationer som vill tillgängliggöra sina öppna data.',
        de: 'EntryScape Registry ist eine Ergänzung zu einem Open Data Portal. Hier finden Sie die Werkzeuge für Behörden, die Daten der öffentlichen Verwaltung zur Weiterverwendung durch Dritte bereitstellen wollen.',
      },
      icon: '',
      details: {
        buttonLabel: { en: 'Get started', sv: 'Kom igång', de: 'Anfangen' },
        header: { en: 'Getting started guide', sv: 'Kom-igång guide', de: 'Erste Schritte' },
        path: '/theme/assets/gettingstarted',
      },
    },
  },
  locale: {
    fallback: 'en',
    supported: [
      {
        lang: 'de', flag: 'de', label: 'Deutsch', labelEn: 'German',
      },
      {
        lang: 'en', flag: 'gb', label: 'English', labelEn: 'English',
      },
      {
        lang: 'sv', flag: 'se', label: 'Svenska', labelEn: 'Swedish',
      },
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
  registry: {
    validationProfiles: [
      { name: 'dcat_ap_se', label: { en: 'Swedish DCAT-AP profile' } },
      { name: 'dcat_ap_dk', label: { en: 'Danish DCAT-AP profile' } },
    ],
    validationTypes: [
      'dcat:Catalog',
      'dcat:Dataset',
      'dcat:Distribution',
      'vcard:Kind',
      'vcard:Individual',
      'vcard:Organization',
      'foaf:Agent'],
    mandatoryValidationTypes: [
      'dcat:Catalog',
      'dcat:Dataset',
    ],
    recipes: ['DCAT', 'INSPIRE', 'CKAN'],
  },
  catalog: {
    catalogLimit: 1,
    datasetLimit: 3,
    fileuploadDistribution: false,
    catalogCollaboration: false,
    excludeEmptyCatalogsInSearch: true,
  },
  entitytypes: {
    question: {
      label: { en: 'Question' },
      rdfType: 'http://schema.org/Question',
      template: 'faq:Question',
      includeInternal: true,
      inlineCreation: true,
      split: true,
      publishable: true,
      faClass: 'question',
      contentviewers: [{
        name: 'answerview',
        relation: 'http://schema.org/acceptedAnswer',
        linkedEntityType: 'answer',
      }],
    },
    answer: {
      label: { en: 'Answer' },
      rdfType: 'http://schema.org/Answer',
      template: 'faq:Answer',
      includeInternal: true,
      inlineCreation: true,
      dependant: true,
    },
  },
  contentviewers: {
    answerview: {
      class: 'LinkedEntriesView', // TODO
      label: { en: 'Answer', sv: 'Answer' },
    },
  },
}, __entryscape_config, window.__entryscape_config_dev || {});

// Use the browser's preferred language as a starting point
i18n.setLocale(navigator.language);

let bestlang;
for (let i = 0; i < config.locale.supported.length; i++) {
  const supportedLang = config.locale.supported[i].lang;
  if (i18n.getLocale().indexOf(supportedLang) === 0) {
    if (bestlang == null || bestlang.length < supportedLang.length) {
      bestlang = supportedLang;
    }
  }
}

if (bestlang) {
  i18n.setLocale(bestlang);
} else {
  i18n.setLocale(config.locale.fallback);
}

export default config;
