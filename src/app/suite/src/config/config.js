import adminConfig from 'admin/config/config';
import catalogConfig from 'catalog/config/config';
import merge from 'commons/merge';
import { i18n } from 'esi18n';
import termsConfig from 'terms/config/config';
import workbenchConfig from 'workbench/config/config';

/**
 * TODO @valentino remove as soon as you fix ES-710
 */
const isDev = __entryscape_config.entryscape.static.version === 'latest';

const STATIC = {
  URL: `https://static.${!isDev ? 'cdn.' : ''}entryscape.com/`, // always with a trailing slash
  APP: 'suite',
  VERSION: 'latest',
};
const ASSETS_URL = __entryscape_config.entryscape.localBuild ? '/dist/assets/' : `${STATIC.URL}${STATIC.APP}/${STATIC.VERSION}/assets/`;
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
    languages: [
      { value: '', label: { en: '' } },
      { value: 'bg', label: { en: 'Bulgarian', bg: 'български', sv: 'bulgariska', de: 'Bulgarisch' } },
      { value: 'cs', label: { en: 'Czech', cs: 'čeština', sv: 'tjeckiska', de: 'Tschechisch' } },
      { value: 'da', label: { en: 'Danish', da: 'dansk', sv: 'danska', de: 'Dänisch' } },
      { value: 'de', label: { en: 'German', de: 'Deutsch', sv: 'tyska' } },
      { value: 'el', label: { en: 'Greek', el: 'ελληνικά', sv: 'grekiska', de: 'Griechisch' } },
      { value: 'en', label: { en: 'English', sv: 'engelska', de: 'Englisch' } },
      { value: 'es', label: { en: 'Spanish', es: 'Español', sv: 'spanska', de: 'Spanisch' } },
      { value: 'et', label: { en: 'Estonian', et: 'Eesti keel', sv: 'estniska', de: 'Estnisch' } },
      { value: 'fi', label: { en: 'Finnish', fi: 'Suomi', sv: 'finska', de: 'Finnisch' } },
      { value: 'fr', label: { en: 'French', fr: 'Français', sv: 'franska', de: 'Französisch' } },
      { value: 'ga', label: { en: 'Irish', ga: 'Gaeilge', sv: 'iriska', de: 'Irisch' } },
      { value: 'hr', label: { en: 'Croatian', hr: 'Hrvatski', sv: 'kroatiska', de: 'Kroatisch' } },
      { value: 'hu', label: { en: 'Hungarian', hu: 'Magyar', sv: 'ungerska', de: 'Ungarisch' } },
      { value: 'it', label: { en: 'Italian', it: 'Italiano', sv: 'italienska', de: 'Italienisch' } },
      { value: 'lt', label: { en: 'Lithuanian', lt: 'Lietuvių kalba', sv: 'litauiska', de: 'Litauisch' } },
      { value: 'lv', label: { en: 'Latvian', lv: 'Latviešu valoda', sv: 'lettiska', de: 'Lettisch' } },
      { value: 'mt', label: { en: 'Maltese', mt: 'Malti', sv: 'maltesiska', de: 'Maltesisch' } },
      {
        value: 'nb',
        label: {
          en: 'Norwegian (bokmål)',
          nb: 'norsk bokmål',
          no: 'norsk bokmål',
          nn: 'norsk bokmål',
          sv: 'norska (bokmål)',
          de: 'Norwegisch (Buchsprache)',
        },
      },
      { value: 'nl', label: { en: 'Dutch', nl: 'Nederlands', sv: 'nederländska', de: 'Niederländisch' } },
      {
        value: 'nn',
        label: {
          en: 'Norwegian (nynorsk)',
          nb: 'norsk nynorsk',
          no: 'norsk nynorsk',
          nn: 'norsk nynorsk',
          sv: 'norska (nynorska)',
          de: 'Norwegisch (Neu)',
        },
      },
      { value: 'pl', label: { en: 'Polish', pl: 'Polski', sv: 'polska', de: 'Polnisch' } },
      { value: 'pt', label: { en: 'Portuguese', pt: 'Português', sv: 'portugisiska', de: 'Portugiesisch' } },
      { value: 'ro', label: { en: 'Romanian', ro: 'Română', sv: 'rumänska', de: 'Rumänisch' } },
      {
        value: 'no',
        label: { en: 'Norwegian', no: 'norsk', nb: 'norsk', nn: 'norsk nynorsk', sv: 'norska', de: 'Norwegisch' },
      },
      { value: 'sk', label: { en: 'Slovak', sk: 'Slovenčina', sv: 'slovakiska', de: 'Slowakisch' } },
      { value: 'sl', label: { en: 'Slovenian', sl: 'Slovenščina', sv: 'slovenska', de: 'Slowenisch' } },
      { value: 'sv', label: { en: 'Swedish', sv: 'svenska', de: 'Schwedisch' } },
    ],
  },
}, __entryscape_config, window.__entryscape_config_dev || {});

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
