__entryscape_config = {
  entryscape: {
    static: {
      url: 'https://static.entryscape.com/',
      app: 'suite',
      version: 'stable',
    },
  },
  entrystore: {
    repository: 'https://dev.entryscape.com/store',
  },
  workbench: {
    includeMassOperations: true,
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
    localTheme: false, // If a local theme should be used
    localAssets: false, // If assets should be fetched from the build or static
    // logo: { // logo configuration
    //   icon: 'entryscape.svg', // icon only logo (file). Defaults to EntryScape logo if needed
    //   // full: '', // logo with icon and text (file). Text is ignored
    //   text: 'EntryScape', // Part of Logo, either appName or text are used. appName has precedence
    // },
  },
  entitytypes: {
    art: {
      label: {en: 'Piece of art', sv: 'Konst'},
      rdfType: 'http://example.com/PieceOfArt',
      template: 'art:PieceOfArt',
      includeInternal: true,
      inlineCreation: true,
      faClass: 'graduation-cap',
      // define which properties to search against, these two are unneccessary since they
      // are part of the default title search, but they show how it works
      searchProps: ['dcterms:title', 'skos:prefLabel'],
    },
    artist: {
      label: {en: 'Artist'},
      rdfType: 'http://example.com/Artist',
      template: 'art:Artist',
      includeInternal: true,
      inlineCreation: true,
      contentviewers: [{name: 'imageview', property: 'foaf:depiction'}],
    },
    image: {
      label: {en: 'Image'},
      rdfType: 'http://xmlns.com/foaf/0.1/Image',
      template: 'art:Image',
      includeFile: true,
      inlineCreation: true,
      split: true,
      contentviewers: ['imageview', 'metadataview'],
    },
    exhibition: {
      label: {en: 'Exhibition'},
      rdfType: 'http://example.com/Exhibition',
      template: 'art:Exhibition',
      includeLink: true,
      inlineCreation: true,
    },
    place: {
      label: {en: 'Place'},
      rdfType: 'http://example.com/Place',
      template: 'art:Place',
      includeInternal: true,
      inlineCreation: true,
    },
    document: {
      label: {en: 'Document'},
      rdfType: 'http://xmlns.com/foaf/0.1/Document',
      template: 'art:Document',
      includeFile: true,
      includeLink: true,
      inlineCreation: true,
    },
  },
  itemstore: {
    bundles: [
      'art',
    ],
  },
  contentviewers: {
    imageview: {
      class: 'ImageView',
      label: {en: 'Image', sv: 'Bild'},
    },
    metadataview: {
      class: 'MetadataView',
      label: {en: 'Information', sv: 'Information'},
    },
  },
  reCaptchaSiteKey: '6LeraBITAAAAAETQ_-wpGZOJ7a9jKRpF1g8OYc2O',
};
