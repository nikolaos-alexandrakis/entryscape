require.config({
  baseUrl: '/libs', // Path relative to bootstrapping html file.
  paths: {
    // Paths relative baseUrl, only those that deviate from baseUrl/{modulename} are explicitly
    // listed.
    'entryscape-suite': '..',
    templates: 'rdforms-templates',
    // 'https://static.entryscape.com/rdforms/latest',
    nls: '../nls/merged',
    theme: '../theme',
    text: 'requirejs-text/text',
    i18n: 'di18n/i18n',
    fuelux: 'fuelux/js',
    bootstrap: 'bootstrap-amd/lib',
    bmd: 'bmd/dist',
    bmddtp: 'bootstrap-material-datetimepicker/js/bootstrap-material-datetimepicker',
    selectize: 'selectize/js/selectize',
    select2: 'select2/src/js',
    jquery: 'jquery/src',
    sizzle: 'sizzle/dist/sizzle',
    'jquery.mousewheel': 'select2/src/js/jquery.mousewheel.shim',
    typeahead: 'typeahead.js/dist/typeahead.jquery',
    jstree: 'jstree/src/jstree',
    'jstree.dnd': 'jstree/src/jstree.dnd',
    'jstree.checkbox': 'jstree/src/jstree.checkbox',
    'jstree.wholerow': 'jstree/src/jstree.wholerow',
    requireLib: 'requirejs/require',
    vis: 'vis/dist/vis',
    leaflet: 'leaflet/dist/leaflet',
    md5: 'md5/js/md5.min',
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
    {
      name: 'select2',
      location: 'select2/src/js',
      main: 'jquery.select2',
    },
  ],
  map: {
    '*': {
      mithril: 'entryscape-commons/shim/mithril',
      polyfill: 'entryscape-commons/shim/polyfill',
      jquery: 'jquery/jquery',  // In general, use the main module (for all unqualified jquery
      // dependencies).
      'jquery/selector': 'jquery/selector-sizzle', // Always use the jquery sizzle selector engine.
      has: 'dojo/has', // Use dojos has module since it is more clever.
      'dojo/text': 'text', // Use require.js text module
      // Make sure i18n, dojo/i18n and di18n/i18n are all treated as a SINGLE module named i18n.
      // (We have mapped i18n to be the module provided in di18n/i18n, see paths above.)
      'dojo/i18n': 'i18n',
      'di18n/i18n': 'i18n',
      'dojo/hccss': 'dojo/has',
    },
    jquery: {
      jquery: 'jquery', // Reset (override general mapping) to normal path (jquerys has
      // dependencies to specific modules).
      'jquery/selector': 'jquery/selector-sizzle', // Always use the jquery sizzle selector engine.
      'external/sizzle/dist/sizzle': 'sizzle',
    },
    bootstrap: {
      jquery: 'jquery', // Reset (override general mapping) to normal path (bootstraps has
      // dependencies to specific dependencies).
      'jquery/selector': 'jquery/selector-sizzle', // Always use the jquery sizzle selector engine.
    },
    'store/Rest': {
      'dojo/request': 'dojo/request/xhr', // Force using xhr since we know we are in the browser
      'dojo/request/iframe': 'dojo/request/iframe', // Override above line for iframe path.
      'dojo/request/script': 'dojo/request/script',
    },
    'rdforms/template/bundleLoader': {
      'dojo/request': 'dojo/request/xhr', // Force using xhr since we know we are in the browser
    },
  },
  deps: [
    'polyfill',
    'config',
    'dojo/text!entryscape-commons/theme/privacy_en.html',
    'dojo/text!entryscape-commons/theme/privacy_sv.html',
    'dojo/text!entryscape-commons/theme/privacy_de.html',
    'entryscape-commons/commonDeps',
    'dojo/request/script',
    'moment/locale/nb',
    'moment/locale/sv',
    'moment/locale/da',
    'moment/locale/de',
    'mithril',
    'entryscape-commons/nav/Cards',
    'entryscape-commons/gce/Cards',
    'entryscape-commons/contentview/ImageView',
    'entryscape-commons/contentview/MetadataView',
    'entryscape-commons/contentview/LinkedEntriesView',
    'entryscape-catalog/catalog/List',
    'entryscape-catalog/files/List',
    'entryscape-catalog/datasets/List',
    'entryscape-catalog/responsibles/List',
    'entryscape-catalog/candidates/CandidateList',
    'entryscape-catalog/results/ResultsList',
    'entryscape-catalog/ideas/IdeasList',
    'entryscape-catalog/overview/Overview',
    'entryscape-terms/scheme/List',
    'entryscape-terms/concept/Concepts',
    'entryscape-terms/concept/List',
    'entryscape-terms/collection/List',
    'entryscape-terms/overview/Overview',
    'entryscape-admin/contexts/List',
    'entryscape-admin/groups/List',
    'entryscape-admin/users/List',
    'entryscape-workbench/space/List',
    'entryscape-workbench/bench/List',
    'entryscape-workbench/bench/Bench',
    'entryscape-workbench/overview/Overview',
    'entryscape-workbench/collection/Collection',
    'entryscape-catalog/public/Public',
    'entryscape-catalog/search/Search',
    'entryscape-catalog/search/DatasetSearch',
    'entryscape-commons/rdforms/GeonamesChooser',
    'entryscape-commons/rdforms/GeoChooser',
    'entryscape-commons/rdforms/SkosChooser',
    'entryscape-commons/rdforms/EntryChooser',
    'templates/skos/skos',
    'templates/dcterms/dcterms',
    'templates/foaf/foaf',
    'templates/vcard/vcard',
    'templates/odrs/odrs',
    'templates/dcat-ap/dcat-ap_props',
    'templates/dcat-ap/dcat-ap',
    'templates/entryscape/esc',
    'select2/select2/i18n/sv', // Explicit load of swedish language for select2 (no require-nls
    // support)
    'entryscape-commons/bmd/all',
  ],
});
