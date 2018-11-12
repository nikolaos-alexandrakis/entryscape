import SchemeList from 'terms/scheme/List';
import Cards from 'commons/gce/Cards';
import Overview from 'terms/overview/Overview';
import Concepts from 'terms/concept/Concepts';
import ConceptsList from 'terms/concept/List';
import CollectionList from 'terms/collection/List';

export default {
  modules: {
    terms: {
      productName: 'Terms',
      faClass: 'sitemap',
      startView: 'terminology__scheme__list',
      sidebar: true,
    },
  },
  views: {
    terminology__scheme__list: {
      class: SchemeList,
      title: { en: 'Termino&shy;logies', sv: 'Termino&shy;logier', de: 'Termino&shy;logien' },
      constructorParams: { rowClickView: 'terminology__overview' },
      faClass: 'archive',
      route: '/terms',
      module: 'terms',
    },
    terminology: {
      class: Cards,
      labelCrumb: true,
      constructorParams: { entryType: 'skos:ConceptScheme' },
      route: '/terms/:context',
      module: 'terms',
      parent: 'terminology__scheme__list',
    },
    terminology__overview: {
      class: Overview,
      faClass: 'eye',
      title: { en: 'Overview', sv: 'Översikt', de: 'Überblick' },
      route: '/terms/:context/overview',
      parent: 'terminology',
      module: 'terms',
    },
    terminology__hierarchy: {
      class: Concepts,
      faClass: 'sitemap',
      wide: false,
      title: { en: 'Hierarchy', sv: 'Hierarki', de: 'Hierarchie' },
      route: '/terms/:context/hierarchy',
      parent: 'terminology',
      module: 'terms',
    },
    terminology__list: {
      class: ConceptsList,
      faClass: 'list',
      title: { en: 'List', sv: 'Lista', de: 'Liste' },
      route: '/terms/:context/list',
      parent: 'terminology',
      module: 'terms',
    },
    terminology__collections: {
      class: CollectionList,
      faClass: 'cubes',
      title: { en: 'Collections', sv: 'Samlingar', de: 'Samm&shy;lun&shy;gen' },
      route: '/terms/:context/collections',
      parent: 'terminology',
      module: 'terms',
    },
  },
};
