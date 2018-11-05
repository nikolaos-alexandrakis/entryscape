import Cards from 'commons/nav/Cards';
import UsersList from '../users/List';
import GroupsList from '../groups/List';
import ContextsList from '../contexts/List';

export default {
  modules: {
    admin: {
      productName: 'Admin',
      faClass: 'cogs',
      restrictTo: 'admin',
      startView: 'admin__users',
      sidebar: true,
    },
  },
  views: {
    admin: {
      class: Cards,
      title: {en: 'Administration', sv: 'Administration', de: 'Administration'},
      route: '/admin',
      module: 'admin',
      sidebar: false,
    },
    admin__users: {
      class: UsersList,
      faClass: 'user',
      title: {en: 'Users', sv: 'Användare', de: 'Benutzer'},
      route: '/admin/users',
      parent: 'admin',
      module: 'admin',
    },
    admin__groups: {
      class: GroupsList,
      faClass: 'users',
      title: {en: 'Groups', sv: 'Grupper', de: 'Gruppen'},
      route: '/admin/groups',
      parent: 'admin',
      module: 'admin',
    },
    admin__projects: {
      class: ContextsList,
      faClass: 'building',
      title: {en: 'Projects', sv: 'Projekt', de: 'Projekte'},
      route: '/admin/projects',
      parent: 'admin',
      module: 'admin',
    },
  },
};
