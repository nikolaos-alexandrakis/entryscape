window.__entryscape_config = {
  entrystore: 'https://data.naturvardsverket.se/store',
  namespaces: {
    nvv: 'https://data.naturvardsverket.se/ns/',
    nvvdok: 'https://data.naturvardsverket.se/ns/dokument/',
    schema: 'http://schema.org/',
  },
  labelProperties: [
    'foaf:name',
    ['foaf:firstName', 'foaf:lastName'],
    ['foaf:givenName', 'foaf:familyName'],
    'vcard:fn',
    'skos:prefLabel',
    'dcterms:title',
    'dc:title',
    'rdfs:label',
    'skos:altLabel',
    'vcard:hasEmail',
    'gn:officialName',
    'gn:name',
  ],
  bundles: [
    'https://data.naturvardsverket.se/libs/rdforms-templates/dc/dc.js',
    'https://data.naturvardsverket.se/libs/rdforms-templates/rdfs/rdfs.js',
    'https://data.naturvardsverket.se/libs/rdforms-templates/schema.org/schema.js',
    'https://data.naturvardsverket.se/libs/rdforms-templates/org/org.js',
    'https://data.naturvardsverket.se/libs/rdforms-templates/gnfeature/geoname.js',
    'https://data.naturvardsverket.se/libs/rdforms-templates/gnfeature/geoname-prop.js',
    'https://data.naturvardsverket.se/theme/nvv.js',
  ],
  collections: [
    {
      name: 'spatial',
      type: 'facet',
      label: 'Geografiskt område',
      property: 'dcterms:spatial',
      nodetype: 'uri',
      rdftype: 'gn:Feature',
      searchproperty: 'gn:name',
    },
    {
      name: 'organization',
      type: 'facet',
      label: 'Publicerande myndighet',
      property: 'dcterms:publisher',
      nodetype: 'uri',
      rdftype: 'org:Organization',
    },
    {
      name: 'organisationsnummer',
      type: 'search',
      label: 'Organisationsnummer:', /* Myndighetens dokument identifierare */
      property: 'nvvdok:organisationsnummer',
      nodetype: 'literal',
    },
    {
      name: 'verksamhetsutovare',
      type: 'search',
      label: 'Företag/Verksamhetsutövare',
      property: 'nvvdok:verksamhetsutovare',
      nodetype: 'literal',
    },
    {
      name: 'objektNamn',
      type: 'search',
      label: 'Anläggningsnamn',
      property: 'nvvdok:objektNamn',
      nodetype: 'literal',
    },
    {
      name: 'bransch',
      type: 'facet',
      label: 'Bransch',
      property: 'nvvdok:bransch',
      nodetype: 'uri',
    },
    {
      name: 'documenttype',
      type: 'facet',
      label: 'Dokumenttyp',
      resets: 'subject',
      property: 'nvvdok:documentType',
      nodetype: 'uri',
      templatesource: 'nvvdok:documentType',
    },
    {
      name: 'subject',
      type: 'facet',
      label: 'Underkategori',
      property: 'dcterms:subject',
    },
    // {
    //   name: 'title',
    //   type: 'rdforms',
    //   label: 'Dokumentinnehåll',
    //   property: 'dcterms:title',
    //   nodetype: 'literal',
    // },
    {
      name: 'arendebeteckning',
      type: 'search',
      label: 'Ärendebeteckning',
      property: 'nvvdok:arendeBeteckning',
      nodetype: 'literal',
    },
  ],
  type2template: {
  },
  entitytypes: {
    sni: {
      constraints: {
        'http://purl.org/dc/terms/partOf': 'https://data.naturvardsverket.se/store/63/resource/1819',
      },
      rdfType: ['http://www.w3.org/2004/02/skos/core#Concept'],
      label: { en: 'Concept' },
      template: 'skosmos:concept',
    },
  },


  blocks: [
    {
      block: 'nmdSearch',
      extends: 'search',
      rdftype: 'nvvdok:Document',
      dependencyproperties: 'dcterms:publisher',
      template: 'nvvdok:Document',
      // click: 'detalj.html',
      headless: true,
      onecol: true,
      limit: '10',
      context: ['43', '54'],
      rowcontext: ['43', '54'],
      templates: {
        listhead: '<div class="listhead">{{resultsize}} träffar. Sida {{currentpage}} av {{pagecount}}</div>',
        rowhead: '<div class="rowhead">' +
        '<h4>{{link click="detalj.html"}} <div class="organisation">Publicerande myndighet: ' +
        '{{link relation="dcterms:publisher" click="Naturvårdsverket.html" clickkey="organization" clickvalue="resource"}}</div></h4></div>',
      },
      facets: true,
      initsearch: true,
    },
    {
      block: 'ndmMetadata',
      extends: 'viewMetadata',
      template: 'nvvdok:Document',
    },
  ],
};
