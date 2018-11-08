import List from 'workbench/space/List';
import Cards from 'commons/gce/Cards';
import Overview from 'workbench/overview/Overview';
import Bench from 'workbench/bench/Bench';

export default {
  modules: {
    workbench: {
      productName: 'Workbench',
      faClass: 'table',
      sidebar: true,
      startView: 'workbench__list',
    },
  },
  views: {
    workbench__list: {
      class: List,
      title: { en: 'Projects', sv: 'Projekt', de: 'Projekte' },
      faClass: 'building',
      route: '/workbench',
      module: 'workbench',
    },
    workbench: {
      class: Cards,
      labelCrumb: true,
      route: '/workbench/:context',
      module: 'workbench',
      parent: 'workbench__list',
    },
    workbench__overview: {
      class: Overview,
      faClass: 'eye',
      title: { en: 'Overview', sv: 'Översikt', de: 'Überblick' },
      route: '/workbench/:context/overview',
      parent: 'workbench',
      module: 'workbench',
    },
    workbench__entities: {
      class: Bench,
      faClass: 'cube',
      title: { en: 'Entities', sv: 'Entiteter', de: 'Objekte' },
      route: '/workbench/:context/entitytype/?entity',
      parent: 'workbench',
      module: 'workbench',
    },
    // workbench__collections: {
    //  class: 'entryscape-workbench/collection/Collection',
    //  faClass: 'cubes',
    //  title: { en: 'Collections', sv: 'Samlingar', de: 'Samm&shy;lun&shy;gen' },
    //  route: '/workbench/:context/collections',
    //  parent: 'workbench',
    //  module: 'workbench',
    // },
  },
};
