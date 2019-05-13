import merge from 'commons/merge';
import adminSiteConfig from 'admin/config/site';
import catalogSiteConfig from 'catalog/config/site';
import workbenchSiteConfig from 'workbench/config/site';
import termsSiteConfig from 'terms/config/site';
import toolsSiteConfig from 'tools/config/site';
import Site from 'commons/nav/Site';
import Layout from 'commons/nav/Layout';
import Start from 'commons/nav/Start';
import Signin from 'commons/nav/Signin';
import Permission from 'commons/nav/Permission';

export default merge(adminSiteConfig, catalogSiteConfig, workbenchSiteConfig, termsSiteConfig, toolsSiteConfig, {
  siteClass: Site, // mandatory
  controlClass: Layout, // mandatory
  startView: 'start', // mandatory
  signinView: 'signin',
  permissionView: 'permission',
  sidebar: { wide: false, always: true, replaceTabs: true },
  views: {
    signin: {
      name: 'signin',
      title: { en: 'Sign in/out', sv: 'Logga in/ut', da: 'Login/ud', de: 'An-/Abmelden' },
      class: Signin,
      constructorParams: { nextView: 'start' },
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
      title: { en: 'Start', sv: 'Start', da: 'Start', de: 'Start' },
      route: '/start',
    },
    documentation: {
      name: 'documentation',
      title: { en: 'Documentation', sv: 'Dokumentation', de: 'Dokumentation' },
      route: 'https://docs.entryscape.com/',
    },
  },
  modules: {
    search: {
      title: { en: 'Search' },
      productName: 'Search',
      faClass: 'search',
      startView: 'catalog__search',
      public: true,
    },
    documentation: {
      title: { en: 'Documentation', sv: 'Dokumentation', de: 'Dokumentation' },
      productName: 'Documentation',
      faClass: 'book',
      startView: 'documentation',
      public: false,
    },
  },
  moduleList: ['catalog', 'terms', 'workbench', 'search', 'tools', 'admin', 'documentation'],
}, __entryscape_config.site || {});
