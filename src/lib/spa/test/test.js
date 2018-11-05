// global variable spa contains what is exported in main.js
const siteConf = {
  'baseUrl': 'https://example.com/',
  'startView': 'admin',
  'signinView': '',
  'permissionView': '',
  'pathIgnore': '',
  'startParams': '',
  'start': '',
  'viewsNode': '',
  'views': [
    {
      name: 'admin',
      class: 'entryscape-commons/nav/Cards',
      title: {en: 'Administration', sv: 'Administration', de: 'Administration'},
      route: '/admin',
      module: 'admin',
      sidebar: false,
    },
    {
      name: 'admin__users',
      class: 'entryscape-admin/users/List',
      faClass: 'user',
      title: {en: 'Users', sv: 'Användare', de: 'Benutzer'},
      route: '/admin/users',
      parent: 'admin',
      module: 'admin',
    },
    {
      name: 'admin__groups',
      class: 'entryscape-admin/groups/List',
      faClass: 'users',
      title: {en: 'Groups', sv: 'Grupper', de: 'Gruppen'},
      route: '/admin/groups',
      parent: 'admin',
      module: 'admin',
    },
    {
      name: 'admin__projects',
      class: 'entryscape-admin/contexts/List',
      faClass: 'building',
      title: {en: 'Projects', sv: 'Projekt', de: 'Projekte'},
      route: '/admin/projects',
      parent: 'admin',
      module: 'admin',
    },
  ],
  'hierarchies': '',
  'controlNode': '',
  'controlClass': '',
  'controlConstructorParams': '',
  modules: {
    admin: {
      productName: 'Admin',
      faClass: 'cogs',
      restrictTo: 'admin',
      startView: 'admin__users',
      sidebar: true,
    },
  },
  'sidebar': '',
};

describe('Site', () => {
  describe('init', () => {
    it('should return an instance of Site', () => {
      spa.initSite(siteConf, (site) => {
        chai.expect(site instanceof spa.Site).to.equal(true);
      });
    });
  });
});

describe('public api', () => {
  it(`should return ${siteConf.views.length} routes`, () => {
    spa.initSite(siteConf, (site) => {
      chai.expect(site.getRoutes().size).to.equal(siteConf.views.length);
    })
  });
  it('should return an object definition for a view', () => {
    spa.initSite(siteConf, (site) => {
      console.log(site.getViewDef('admin'));
      chai.expect(site.getViewDef('admin')).to.be.an('object').that.has.property('name', 'admin');
    })
  });
});
