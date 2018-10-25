__entryscape_config = {
  staticBuildVersion: '1.5.2',
  entrystore: {
    repository: 'https://dev.entryscape.com/store',
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
      appName: 'EntryScape',
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
    country: {
      label: {en: 'Country'},
      rdfType: 'http://www.geonames.org/ontology#Feature',
      template: 'gn:Feature',
      includeFile: false,
      includeLink: true,
      includeInternal: false,
      inlineCreation: true,
    },
    question: {
      label: {en: 'Question'},
      rdfType: 'http://schema.org/Question',
      template: 'faq:Question',
      includeInternal: true,
      inlineCreation: true,
      split: true,
      publishable: true,
      faClass: 'question',
      contentviewers: [{
        name: 'answerview',
        relation: 'http://schema.org/acceptedAnswer',
        linkedEntityType: 'answer',
      }],
    },
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
