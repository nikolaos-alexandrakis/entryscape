window.__entryscape_config = {
  block: 'config',
  entrystore: 'https://opendata.statenskonstrad.se/store',
  namespaces: {
    gn: 'http://www.geonames.org/ontology#',
    schema: 'http://schema.org/',
    land: 'http://www.cadastralvocabulary.org/land#',
    ecpo: 'http://publications.europa.eu/resource/authority/',
    skr: 'https://opendata.statenskonstrad.se/terms/',
  },
  labelProperties: [
    'dcterms:title',
    'dcterms:identifier',
    'dc:title',
    'foaf:name',
    ['foaf:firstName', 'foaf:lastName'],
    ['foaf:givenName', 'foaf:familyName'],
    'gn:name',
    'dc:rights',
    'foaf:gender',
    'land:nationalCadastralReference',
    'land:id',
    'rdfs:label',
    'schema:address',
    ['schema:streetAddress', 'schema:addressLocality', 'schema:addressRegion'],
    'schema:birthDate',
    'schema:caption',
    'schema:contentURL',
    'schema:deathDate',
    'skos:altLabel',
    'skos:prefLabel',
    'vcard:fn',
    'vcard:hasEmail',

  ],
  bundles: [
    'https://static.entryscape.com/templates/dc/dc.js',
    'https://static.entryscape.com/templates/rdfs/rdfs.js',
    'https://static.entryscape.com/templates/schema.org/schema.js',
    'https://opendata.statenskonstrad.se/theme/skr.js',
  ],
  type2template: {
    'skr:Artist': 'skr:Artist',
    'http://www.cadastralvocabulary.org/CaLAThe/PropertyUnit': 'skr:PropertyUnit',
    'schema:PostalAddress': 'skr:PostalAddress',
  },
  collections: [
    {
      type: 'facet',
      name: 'artform',
      label: 'Huvudkategori',
      property: 'http://schema.org/artform',
      nodetype: 'literal',
      limit: 10,
      includeAsFacet: true,
    },
    {
      type: 'facet',
      name: 'environment',
      label: 'Miljö',
      property: 'https://opendata.statenskonstrad.se/terms/environment',
      nodetype: 'literal',
      limit: 10,
      includeAsFacet: true,
    },
    {
      type: 'facet',
      name: 'projectType',
      label: 'Projekttyp',
      property: 'https://opendata.statenskonstrad.se/terms/projectType',
      nodetype: 'literal',
      limit: 10,
      includeAsFacet: true,
    },
    {
      type: 'facet',
      name: 'situation',
      label: 'Läge',
      property: 'https://opendata.statenskonstrad.se/terms/situation',
      nodetype: 'uri',
      templatesource: 'skr:situation',
      limit: 10,
      includeAsFacet: true,
    },
    {
      type: 'search',
      name: 'artist',
      label: 'Konstnär',
      property: 'http://purl.org/dc/terms/creator',
      rdftype: 'https://opendata.statenskonstrad.se/terms/Artist',
      nodetype: 'uri',
      limit: 10,
      context: '9',
      includeAsFacet: false,
    },
    {
      type: 'search',
      name: 'location',
      label: 'Fastighet',
      property: 'schema:location',
      rdftype: 'http://www.cadastralvocabulary.org/CaLAThe/PropertyUnit',
      searchproperty: 'http://www.cadastralvocabulary.org/land#nationalCadastralReference',
      nodetype: 'uri',
      limit: 10,
      context: '9',
      includeAsFacet: false,
    },
    {
      type: 'search',
      name: 'address',
      label: 'Adress',
      property: 'schema:address',
      rdftype: 'schema:PostalAddress',
      searchproperty: 'schema:addressRegion',
      nodetype: 'uri',
      limit: 10,
      context: '9',
      includeAsFacet: false,
    },
    {
      type: 'facet',
      name: 'category',
      label: 'Underkategori',
      property: 'https://opendata.statenskonstrad.se/terms/subcategory',
      nodetype: 'literal',
      limit: 10,
      includeAsFacet: false,
    },
  ],
  blocks: [
    {
      block: 'skrList',
      extends: 'searchList',
      rdftype: 'https://opendata.statenskonstrad.se/terms/WorkOfArt',
      context: '9',
      facets: true,
      headless: true,
      layout: 'cards',
//      click: 'details.html?debug',
      dependencyproperties: 'dcterms:creator,schema:address',
      limit: 10,
      templates: {
        rowhead: '{{image property="schema:image" fallback="https://opendata.statenskonstrad.se/theme/blocks/bild_saknas.jpg' +
          '"}} <div class="info-card-header">' +
          '<div class="cardList-title__art">{{text}}</div>' +
          '<div class="cardList-title__date">{{text content="${dcterms:created}"}}</div></div>' +
          '<div class="info-card-header">' +
          '<div class="cardList-title__text">{{text  relation="dcterms:creator"}}</div>' +
          '<div class="cardList-title__text category">{{text  content="${schema:artform}"}}</div></div>' +
          '<div class="info-card-header"><div class="cardList-title__text category">{{text content="${skr:site}"}}</div>' +
          '<div class="cardList-title__text category">{{text  relation="schema:address" content="${schema:addressLocality}"}}</div></div>',
        listplaceholder: '<h3>No matching results</h3>',
      },
    },
    {
      block: 'skrArtist',
      extends: 'template',
      relation: 'dcterms:creator',
      htemplate: '<div class="rdformsPresenter"><div class="rdformsRow rdformsTopLevel">' +
        '<div class="rdformsLabel">Konstnär</div>' +
        '<div class="rdformsFields"><div class="rdformsField"><div class="rdformsField">' +
        '{{text content="${foaf:name}"}}' +
        '{{#ifprop "schema:birthDate,schema:deathDate"}}' +
        '&nbsp;({{text property="schema:birthDate" fallback="&nbsp;"}} - {{text property="schema:deathDate"' +
        ' fallback="&nbsp;"}})' +
        '{{/ifprop}}' +
        '</div></div></div></div></div>',
    },
  ],
};

let btnFilter = document.querySelector('.btn--filter--mobile');
let filterMobile = document.querySelector('.facets--mobile');
let btnClose = document.querySelector('.btn--close');

if (btnFilter) {
  btnFilter.onclick = function () {
    filterMobile.classList.toggle('hidden');
    console.log('clicked!');
  };
}

if (btnClose) {
  btnClose.onclick = function () {
    filterMobile.classList.toggle('hidden');
    console.log('closed!');
  };
}
