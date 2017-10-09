define([
  'dojo/_base/kernel',
  'entryscape-commons/merge',
  'entryscape-admin/config/adminConfig',
  'entryscape-catalog/config/catalogConfig',
  'entryscape-terms/config/termsConfig',
  'entryscape-workbench/config/workbenchConfig',
], (kernel, merge, adminConfig, catalogConfig, termsConfig, workbenchConfig) => {
  const config = merge(adminConfig, catalogConfig, termsConfig, workbenchConfig, {
    theme: {
      appName: 'EntryScape',
      oneRowNavbar: false,
      localTheme: false,
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
      siteClass: 'entryscape-commons/nav/Site',
      routerClass: 'entryscape-commons/nav/Router',
      controlClass: 'entryscape-commons/nav/Layout',
      signinView: 'signin',
      permissionView: 'permission',
      startView: 'start',
      sidebar: { wide: false, always: true, replaceTabs: true },
      views: {
        signin: {
          title: { en: 'Sign in/out', sv: 'Logga in/ut', da: 'Login/ud', de: 'An-/Abmelden' },
          class: 'entryscape-commons/nav/Signin',
          constructorParams: { nextView: 'start' },
        },
        permission: {
          title: { en: 'You do not have permission to view this page', sv: 'Logga in/ut', da: 'Login/ud', de: 'An-/Abmelden' },
          class: 'entryscape-commons/nav/Permission',
        },
        start: {
          class: 'entryscape-commons/nav/Start',
          title: { en: 'Start', sv: 'Start', da: 'Start', de: 'Start' },
        },
      },
      modules: {
        search: {
          title: { en: 'Search' },
          productName: 'Search',
          faClass: 'search',
          hierarchy: {
            view: 'search',
            subViews: [{
              view: 'dataset',
            }],
          },
          public: true,
        },
      },
      moduleList: ['catalog', 'terms', 'workbench', 'search', 'admin'],
    },
  }, __entryscape_config);

  let bestlang;
  for (let i = 0; i < config.locale.supported.length; i++) {
    const l = config.locale.supported[i].lang;
    if (kernel.locale.indexOf(l) === 0) {
      if (bestlang == null || bestlang.length < l.length) {
        bestlang = l;
      }
    }
  }
  kernel.locale = bestlang || config.locale.fallback;
  return config;
});
