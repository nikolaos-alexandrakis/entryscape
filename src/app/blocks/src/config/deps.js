require.config({
  baseUrl: '../../libs', // Path relative to bootstrapping html file from samples dir.
  paths: {   // Paths relative baseUrl, only those that deviate from baseUrl/{modulename} are explicitly listed.
    'entryscape-blocks': '..',
    requireLib: 'requirejs/require',
    handlebars: 'handlebars/handlebars.amd',
    templates: 'rdforms-templates',
    nls: '../nls/merged',
    theme: 'entryscape-commons/theme',
    localtheme: '../theme',
    text: 'requirejs-text/text',
    i18n: 'di18n/i18n',
    fuelux: 'fuelux/js',
    select2: 'select2/src/js',
    requireLib: 'requirejs/require',
    md5: 'md5/js/md5.min',
    typeahead: 'typeahead.js/dist/typeahead.jquery',
    selectize: 'selectize/js/selectize',
    Chartist: 'chartist/dist/chartist',
    'chartist-plugin-legend': 'chartist-plugin-legend-latest/chartist-plugin-legend',
  },
  packages: [ // Config defined using packages to allow for main.js when requiring just config.
    {
      name: 'config',
      location: '../config',
      main: 'main',
    },
    {
      name: 'moment',
      main: 'moment',
    },
    {
      name: 'mithriljs',
      main: 'mithril',
    },
    {
      name: 'babel-polyfill',
      location: 'babel-polyfill/dist',
      main: 'polyfill',
    },
  ],
  map: {
    '*': {
      mithril: 'entryscape-commons/shim/mithril',
      polyfill: 'entryscape-commons/shim/polyfill',
      chartist: 'Chartist',
      has: 'dojo/has', // Use dojos has module since it is more clever.
      'dojo/text': 'text', // Use require.js text module
            // Make sure i18n, dojo/i18n and di18n/i18n are all treated as a SINGLE module named i18n.
            // (We have mapped i18n to be the module provided in di18n/i18n, see paths above.)
      'dojo/i18n': 'i18n',
      'di18n/i18n': 'i18n',
      'dojo/hccss': 'dojo/has',
    },
    'store/Rest': {
      'dojo/request': 'dojo/request/xhr', // Force using xhr since we know we are in the browser
      'dojo/request/iframe': 'dojo/request/iframe', // Override above line for iframe path.
      'dojo/request/script': 'dojo/request/script',
    },
    'rdforms/template/bundleLoader': {
      'dojo/request': 'dojo/request/xhr',  // Force using xhr since we know we are in the browser
    },
  },
  deps: [
    'polyfill',
    'config/existing',
    'moment/locale/nb',
    'moment/locale/sv',
    'entryscape-blocks/boot/block',
    'spa/Site',
    'dojo/selector/_loader',
    'dojo/request/iframe',
    'dojo/request/script',
    'templates/skos/skos',
    'templates/dcterms/dcterms',
    'templates/foaf/foaf',
    'templates/vcard/vcard',
    'templates/odrs/odrs',
    'templates/dcat-ap/dcat-ap_props',
    'templates/dcat-ap/dcat-ap',
    'templates/entryscape/esc',
    'entryscape-commons/rdforms/EntryChooser',
    'i18n!rdforms/view/nls/rdforms',
    'i18n!nls/escoRdforms',
    'i18n!nls/escoDialogs',
    'i18n!nls/escoErrors',
    'i18n!nls/escoList',
    'i18n!nls/escaDataset',
    'i18n!dojo/cldr/nls/gregorian',
    'rdforms/view/bootstrap/all', // RDForms bootstrap dependency.
  ],
});
