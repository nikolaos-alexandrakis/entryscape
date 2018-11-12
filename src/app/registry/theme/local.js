__entryscape_config = {
  entryscape: {
    static: {
      url: 'https://static.entryscape.com/',
      app: 'registry',
      version: 'latest',
    },
  },
  entrystore: {
    repository: 'https://v.dev.entryscape.com/store',
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
      'rdfs',
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

/* eslint camelcase: "off" */
__entryscape_config = {
  entryscape: {
    static: {
      url: 'https://static.entryscape.com/',
      app: 'registry',
      version: 'latest',
    },
  },
  baseUrl: 'https://registry-dev.entryscape.com', // base app url, without trailing slash
  localbuild: false,
  entrystore: {
    repository: 'https://dev.entryscape.com/store/',
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
      sv: 'Om du är ansvarig för denna organisation så kan du logga in med adressen ovan, om det är första gången måste du göra en lösenordsåterställning. Om mailadressen är fel för din organisation, kontakta Riksarkivet på vidareutnyttjande@riksarkivet.se. När du väl är inloggad kan du gå in under "Organisationer" och ändra adress till skördningskällan i menyn för din organisation.',
      en: 'If you are responsible for this organization you should be able to sign in with the email address above, if it is the first time you will likely have to do a password reset. If the email address is wrong for your organization, contact Riksarkivet at vidareutnyttjande@riksarkivet.se. After you signed in you can go to "Organizations" and change the address to the harvesting source in the menu for your organization.',
    },
    psidataPath: 'psidata',
  },
  theme: {
    appName: 'Registry',
    localTheme: true,
    default: {
      appName: 'Registry',
      logo: 'https://static.entryscape.com/resources/entryscape.svg',
      themePath: 'entryscape-commons/theme/',
    },
    /*    logo: { // logo configuration
          icon: 'logo-small.png',
          full: 'logo.png', // logo with icon and text (file). Text is ignored
          },*/
    privacyLink: "http://example.com",
    startBanner: {
      header: {
        de: 'Register offener Verwaltungsdaten',
        en: 'Register of open administrative data',
      },
      text: {
        de: 'Hier finden Sie die Werkzeuge für Behörden, die Daten der öffentlichen Verwaltung zur Weiterverwendung durch Dritte bereitstellen wollen.',
        en: 'Here are the tools for government agencies that want to provide public administration data for re-use by third parties.',
      },
      details: {
        buttonLabel: { de: 'Anfangen', en: 'Get started' },
        icon: 'theme/logo.png',
        header: { en: 'Getting started with using register.oppnadata.sachsen.de' },
        path: '/theme/texts/gettingstarted',
      },
    },
  },
  site: {
    '!moduleList': ['status', 'search', 'register', 'toolkit', 'admin'],
    views: {
      catalog__datasets: {
        showParams: {
          context: '1',
        },
      },
    },
  },
  catalog: {
    excludeEmptyCatalogsInSearch: true,
    catalogTemplateId: 'dcat:OnlyCatalog',
    datasetTemplateId: 'dcat:OnlyDataset',
    distributionTemplateId: 'dcat:OnlyDistribution',
  },
  reCaptchaSiteKey: "6Ld90x4TAAAAAOtkjNH01CEx-N7eBkfgSB83hLiy"
};

