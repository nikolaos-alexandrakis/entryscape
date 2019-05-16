/* eslint-disable max-len */
import adminSiteConfig from 'admin/config/site';
import catalogSiteConfig from 'catalog/config/site';
import Public from 'catalog/public/Public';
import merge from 'commons/merge';
import Layout from 'commons/nav/Layout';
import Permission from 'commons/nav/Permission';
import Signin from 'commons/nav/Signin';

import Site from 'commons/nav/Site';
import config from 'config';
import Convert from 'registry/convert/Convert';
import HarvestList from 'registry/harvest/List';
import PipelineResultsView from 'registry/harvest/PipelineResultsView';
import Merge from 'registry/merge/Merge';
import Start from 'registry/nav/Start';
import List from 'registry/present/List';
import Source from 'registry/source/Source';
import OtherStatus from 'registry/status/OtherStatus';
import PSIStatus from 'registry/status/PSIStatus';
import Visualization from 'registry/status/Visualization';
import Report from 'registry/validate/Report';
import workbenchSiteConfig from 'workbench/config/site';

const siteConfigs = merge(adminSiteConfig, catalogSiteConfig, workbenchSiteConfig, {
  siteClass: Site,
  controlClass: Layout,
  signinView: 'signin',
  permissionView: 'permission',
  startView: 'start',
  sidebar: { wide: false, always: true, replaceTabs: true },
  moduleList: ['status', 'search', 'register', 'toolkit', 'admin'],
  '!modules': {
    status: {
      productName: 'Status',
      startView: 'status__visualization', // compulsory
      title: { en: 'Status report', sv: 'Statusrapport', de: 'Statusbericht' },
      sidebar: true,
      asCrumb: true,
      faClass: 'eye',
      text: {
        sv: 'En automatiserad granskning av vilka offentliga organisationer som redovisar sin öppna data',
        en: 'An automated audit of which public organizations that document their open data',
        de: 'Ein automatisch erstellter Bericht über welche öffentlichen Organisationen ihre offenen Daten dokumentieren',
      },
    },
    search: {
      productName: 'Browse',
      startView: 'catalog__search', // compulsory
      title: { en: 'Dataset search', sv: 'Datamängds&shy;sök', de: 'Datensatz&shy;suche' },
      faClass: 'search',
      sidebar: true,
      text: {
        sv: 'Sök fram och utforska de datamängder som framgångsrikt skördats',
        en: 'Search and view the datasets that has been successfully harvested',
        de: 'Suchen und anzeigen von erfolgreich geharvesteten Datensätzen',
      },
    },
    register: {
      productName: 'Organizations',
      title: {
        en: 'Organizations',
        sv: 'Organisationer',
        de: 'Quellen',
      },
      startView: 'harvest__list', // compulsory,
      asCrumb: true,
      faClass: 'list',
      sidebar: true,
      text: {
        sv: 'Registera organisationer och deras kataloger som ska skördas',
        en: 'Register organizations and their catalogs to be harvested',
        de: 'Registrieren von Katalogen die geharvested werden sollen',
      },
    },
    toolkit: {
      faClass: 'wrench',
      title: { en: 'Toolkit', sv: 'Verktygslåda', de: 'Toolkit' },
      startView: 'toolkit__rdf__source', // compulsory,
      asCrumb: true,
      sidebar: true,
      text: {
        sv: 'En verktygslåda för att jobba med DCAT-AP metadata',
        en: 'A toolkit for working with DCAT-AP metadata',
        de: 'Ein Toolkit für die Arbeit mit DCAT-AP Metadaten',
      },
    },
    admin: {
      title: { en: 'Admini&shy;stration', sv: 'Admini&shy;strera', de: 'Verwaltung' },
      faClass: 'cogs',
      startView: 'admin__users',
      sidebar: true,
      restrictTo: 'admin',
      text: {
        sv: 'Administrera projekt, användare och grupper',
        en: 'Manage projects, users and groups',
        de: 'Verwaltung von Projekten, Benutzern und Gruppen',
      },
    },
  },
  views: {
    start: {
      class: Start,
      title: {
        en: 'Start', sv: 'Start', da: 'Start', de: 'Start',
      },
      route: '/start',
    },
    signin: {
      title: {
        en: 'Sign in/out', sv: 'Logga in/ut', da: 'Login/,d', de: 'An-/Abmelden',
      },
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
    '!catalog__datasets__preview': {
      class: Public,
      title: { en: 'Datasets Preview', sv: 'Data&shy;mängder', da: 'Datasæt', de: 'Daten&shy;sätze' },
      route: '/catalog/:context/datasets/:dataset',
    },
    harvest__list: {
      class: HarvestList,
      title: { en: 'Harvesting sources', sv: 'Skördningskällor', de: 'Harvesting-Quellen' },
      hidden: true,
      faClass: 'list',
      route: '/organization',
      module: 'register',
    },
    harvest__org: {
      class: PipelineResultsView,
      faClass: 'question',
      parent: 'harvest__list',
      route: '/organization/:context',
      module: 'register',
      constructorParams: { inDialog: false },
    },
    status__visualization: {
      class: Visualization,
      title: { en: 'Overview', sv: 'Översikt' },
      route: '/status/overview',
      module: 'status',
    },
    status__public: {
      class: PSIStatus,
      title: {
        en: 'Public organizations',
        sv: 'Offentliga organisationer',
        de: 'Öffentliche Organisationen',
      },
      route: '/status/public',
      module: 'status',
    },
    status__other: {
      class: OtherStatus,
      title: {
        en: 'Other organizations',
        sv: 'Övriga organisationer',
        de: 'Übrige Organisationen',
      },
      route: '/status/other',
      module: 'status',
    },
    toolkit__rdf__source: {
      class: Source,
      title: { en: 'Catalog source', sv: 'Katalog&shy;källa', de: 'Katalogquelle' },
      faClass: 'database',
      route: '/toolkit/source',
      module: 'toolkit',
    },
    toolkit__validator__report: {
      class: Report,
      title: { en: 'Validate', sv: 'Validera', de: 'Validieren' },
      faClass: 'check-square-o',
      text: {
        sv: 'Validera dina datamängdsbeskrivningar',
        en: 'Validate your dataset descriptions',
        de: 'Validieren Sie Ihre Datensatz-Beschreibungen',
      },
      route: '/toolkit/validate',
      module: 'toolkit',
    },
    toolkit__dcat__merge: {
      class: Merge,
      faClass: 'filter',
      title: { en: 'Merge', sv: 'Slå samman', de: 'Kombinieren' },
      route: '/toolkit/merge',
      module: 'toolkit',
    },
    toolkit__dcat__view: {
      class: List,
      faClass: 'search',
      title: { en: 'Explore', sv: 'Utforska', de: 'Untersuchen' },
      route: '/toolkit/view',
      module: 'toolkit',
    },
    toolkit__dcat__convert: {
      class: Convert,
      faClass: 'random',
      title: { en: 'Convert', sv: 'Konver&shy;tera', de: 'Konvertieren' },
      route: '/toolkit/convert',
      module: 'toolkit',
    },
  },
});

config.site = siteConfigs;

export default merge(siteConfigs, __entryscape_config.site || {});
