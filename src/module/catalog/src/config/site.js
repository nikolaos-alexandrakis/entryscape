import CatalogList from 'catalog/catalog/List';
import Cards from 'commons/gce/Cards';
import Overview from 'catalog/overview/Overview';
import FilesList from 'catalog/files/List';
import CandidateList from 'catalog/candidates/CandidateList';
import DatasetList from 'catalog/datasets/List';
import Public from 'catalog/public/Public';
import ShowcasesList from 'catalog/showcases/List';
import IdeasList from 'catalog/ideas/List';
import ContactsList from 'catalog/contacts/List';
import Search from 'catalog/search/Search';
import DocumentsList from 'catalog/documents/List';
import StatisticsView from 'catalog/statistics/View';

export default {
  modules: {
    catalog: {
      productName: 'Catalog',
      faClass: 'archive',
      startView: 'catalog__list', // compulsory
      sidebar: true,
    },
  },
  views: {
    catalog__list: {
      class: CatalogList,
      title: { en: 'Catalogs', sv: 'Kataloger', da: 'Kataloger', de: 'Kataloge' },
      constructorParams: {
        rowClickView: 'catalog__datasets', // refers to a view name
      },
      faClass: 'archive',
      route: '/catalog',
      module: 'catalog',
    },
    catalog: {
      class: Cards,
      labelCrumb: true,
      constructorParams: { entryType: 'dcat:Catalog' },
      module: 'catalog',
      route: '/catalog/:context',
      parent: 'catalog__list',
    },
    catalog__overview: {
      title: { en: 'Overview', sv: 'Översikt', de: 'Überblick' },
      class: Overview,
      faClass: 'eye',
      route: '/catalog/:context/overview',
      parent: 'catalog',
      module: 'catalog',
    },
    catalog__file: {
      class: FilesList,
      faClass: 'files-o',
      title: { en: 'Files', sv: 'Filer', de: 'Dateien' },
      route: '/catalog/:context/files', // ^/context/\w+/files/?$
      parent: 'catalog',
      module: 'catalog',
      navbar: false,
    },
    catalog__candidates: {
      title: {
        en: 'Candi&shy;dates',
        sv: 'Kandi&shy;dater',
        da: 'Kandi&shy;dater',
        de: 'Kandi&shy;daten',
      },
      class: CandidateList,
      faClass: 'tasks',
      route: '/catalog/:context/candidates',
      parent: 'catalog',
      module: 'catalog',
    },
    catalog__datasets: {
      class: DatasetList,
      faClass: 'cubes',
      title: { en: 'Datasets', sv: 'Data&shy;mängder', da: 'Datasæt', de: 'Daten&shy;sätze' },
      constructorParams: { createAndRemoveDistributions: true },
      route: '/catalog/:context/datasets',
      parent: 'catalog',
      module: 'catalog',
    },
    catalog__datasets__preview: {
      class: Public,
      title: { en: 'Datasets Preview', sv: 'Data&shy;mängder', da: 'Datasæt', de: 'Daten&shy;sätze' },
      route: '/catalog/:context/datasets/:dataset',
      parent: 'catalog__datasets',
      module: 'catalog',
    },
    catalog__showcases: {
      title: { en: 'Showcases', sv: 'Showcases', da: 'Showcases', de: 'Showcases' },
      class: ShowcasesList,
      faClass: 'diamond',
      route: '/catalog/:context/showcases',
      parent: 'catalog',
      module: 'catalog',
    },
    catalog__ideas: {
      title: { en: 'Ideas', sv: 'Idéer', da: 'Ideer', de: 'Ideen' },
      class: IdeasList,
      faClass: 'lightbulb-o',
      route: '/catalog/:context/ideas',
      parent: 'catalog',
      module: 'catalog',
    },
    catalog__publishers: {
      class: ContactsList,
      faClass: 'users',
      title: {
        en: 'Publishers',
        sv: 'Organisa&shy;tioner',
        da: 'Organisa&shy;tioner',
        de: 'Heraus&shy;geber',
      },
      constructorParams: { publishers: true, contacts: false },
      route: '/catalog/:context/publishers',
      parent: 'catalog',
      module: 'catalog',
    },
    catalog__contacts: {
      class: ContactsList,
      faClass: 'phone',
      title: { en: 'Contacts', sv: 'Kontakter', da: 'Kontakter', de: 'Kontakte' },
      constructorParams: { publishers: false, contacts: true },
      route: '/catalog/:context/contacts',
      parent: 'catalog',
      module: 'catalog',
    },
    catalog__search: {
      class: Search,
      title: { en: 'Search', sv: 'Sök', de: 'Suche' },
      route: '/search',
      module: 'search',
      navbar: false,
    },
    catalog__dataset__search: {
      class: Search,
      title: { en: 'Search datasets', sv: 'Sök datamängder', de: 'Suche nach Datensätzen' },
      route: '/search/:context',
      module: 'search',
      parent: 'catalog__search',
      navbar: false, // TODO describe
    },
    catalog__documents: {
      class: DocumentsList,
      faClass: 'file',
      title: { en: 'Documents', sv: 'Dokument', de: 'Dokumente' },
      route: '/catalog/:context/documents',
      parent: 'catalog',
      module: 'catalog',
    },
    catalog__statistics: {
      title: { en: 'Statistics', sv: 'Statistics', de: 'Statistics' },
      class: StatisticsView,
      faClass: 'stat',
      route: '/catalog/:context/statistics',
      parent: 'catalog',
      module: 'catalog',
    },
  },
};
