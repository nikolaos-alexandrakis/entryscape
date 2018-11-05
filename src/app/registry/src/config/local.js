__entryscape_config = {
  entrystore: {
    repository: 'http://localhost:8888/',
  },
  registry: {
    type2template: {
      'dcat:Catalog': 'dcat:OnlyCatalog',
      'dcat:Dataset': 'dcat:OnlyDataset',
      'dcat:Distribution': 'dcat:OnlyDistribution',
      'vcard:Kind': 'dcat:contactPoint',
      'vcard:Individual': 'dcat:contactPoint',
      'vcard:Organization': 'dcat:contactPoint',
      'foaf:Agent': 'dcat:foaf:Agent',
    },
    mandatoryTypes: ['dcat:Catalog', 'dcat:Dataset'],
    contactText: {
      sv: 'to be filled',
      en: 'to be filled',
    },
    psidataPath: 'psidata',
  },
  theme: {
    localTheme: true, // If a local theme should be used
    default: {
      appName: 'Registry',
      logo: 'https://static.entryscape.com/resources/entryscape.svg',
      themePath: 'commons/theme/',
    },
    logo: { // logo configuration
      icon: 'logo.svg', // icon only logo (file). Defaults to EntryScape logo if needed
      full: 'logo.png', // logo with icon and text (file). Text is ignored
      text: 'EntryScape', // Part of Logo, either appName or text are used. appName has precedence
    },
  },
  itemstore: {
    bundles: [
      'templates/rdfs/rdfs',
    ],
  },
  entitytypes: {
    class: {
      label: { en: 'Class', sv: 'Klass' },
      rdfType: 'https://www.w3.org/2000/01/rdf-schema#Class',
      template: 'rdfs:Class',
      templateLevel: 'optional',
      includeInternal: false,
      includeLink: true,
      createDialog: true,
      importDialog: false,
    },
    property: {
      label: { en: 'Property', sv: '' },
      rdfType: 'https://www.w3.org/1999/02/22-rdf-syntax-ns#Property',
      template: 'rdf:Property',
      templateLevel: 'optional',
      includeInternal: false,
      includeLink: true,
      createDialog: true,
      importDialog: false,
    },
    organization: {
      label: { en: 'Organization', sv: 'Organisation' },
      rdfType: 'http://www.w3.org/ns/org#Organization',
      template: 'org:Organization',
      templateLevel: 'recommended',
      includeInternal: true,
      createDialog: true,
      importDialog: false,
    },
    organizationunit: {
      label: { en: 'Unit', sv: 'Enhet' },
      rdfType: 'http://www.w3.org/ns/org#OrganizationalUnit',
      template: 'org:OrganizationalUnit',
      templateLevel: 'recommended',
      includeInternal: true,
      createDialog: true,
      importDialog: false,
    },
    site: {
      label: { en: 'Site', sv: 'Plats' },
      rdfType: 'http://www.w3.org/ns/org#Site',
      template: 'org:Site',
      templateLevel: 'recommended',
      includeInternal: true,
      inlineCreation: true,
      createDialog: true,
      importDialog: false,
    },
    organizationperson: {
      label: { en: 'Person', sv: 'Person' },
      rdfType: 'http://xmlns.com/foaf/0.1/Person',
      template: 'org:Person',
      templateLevel: 'recommended',
      includeInternal: true,
      createDialog: true,
      importDialog: false,
    },
    roll: {
      label: { en: 'Role', sv: 'Roll' },
      rdfType: 'http://www.w3.org/ns/org#Membership',
      template: 'org:Membership',
      templateLevel: 'recommended',
      includeInternal: true,
      createDialog: true,
      importDialog: false,
    },
  },
  reCaptchaSiteKey: '6LeraBITAAAAAETQ_-wpGZOJ7a9jKRpF1g8OYc2O',
};
