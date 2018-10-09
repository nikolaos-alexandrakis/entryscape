import merge from 'commons/merge';
import adminSiteConfig from 'admin/config/site';
import cataloSitegConfig from 'catalog/config/site';
import workbenchSiteConfig from 'workbench/config/site';
import termsSiteConfig from 'terms/config/site';

import Site from 'commons/nav/Site';
import Layout from 'commons/nav/Layout';
import Start from 'registry/nav/Start';
import Signin from 'commons/nav/Signin';
import Permission from 'commons/nav/Permission';

export default merge(adminSiteConfig, cataloSitegConfig, workbenchSiteConfig, termsSiteConfig, {
  siteClass: Site, // mandatory
  controlClass: Layout, // mandatory
  startView: 'start', // mandatory
  signinView: 'signin',
  permissionView: 'permission',
  sidebar: {wide: false, always: true, replaceTabs: true},
  views: {
    signin: {
      name: 'signin',
      title: {en: 'Sign in/out', sv: 'Logga in/ut', da: 'Login/ud', de: 'An-/Abmelden'},
      class: Signin,
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
      class: Permission,
      route: '/permission',
    },
    start: {
      name: 'start',
      class: Start,
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
}, __entryscape_config.site || {});
