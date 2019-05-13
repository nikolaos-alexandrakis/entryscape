import Migrate from 'tools/migrate/View';

export default {
  modules: {
    tools: {
      title: { en: 'Tools', sv: 'Verktyg', de: 'Werkzeuge' },
      productName: 'Tools',
      faClass: 'tools',
      startView: 'tools__migrate',
      sidebar: true,
    },
  },
  views: {
    tools__migrate: {
      class: Migrate,
      title: { en: 'Migrate', sv: 'Migrera' },
      faClass: 'tools',
      route: '/tools',
      module: 'tools',
    },
  },
};
