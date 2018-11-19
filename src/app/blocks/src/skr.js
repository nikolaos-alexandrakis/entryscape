/* eslint-disable max-len */
/* eslint-disable no-template-curly-in-string */
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
    'dcterms:identifier',
    'dcterms:title',
    'dc:title',
    'dc:rights',
    'foaf:gender',
    'foaf:name',
    ['foaf:firstName', 'foaf:lastName'],
    ['foaf:givenName', 'foaf:familyName'],
    'gn:name',
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
    'templates/dc/dc',
    'templates/rdfs/rdfs',
    'templates/schema.org/schema',
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
      type: 'search',
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
      click: 'details.html?debug',
      dependencyproperties: 'dcterms:creator,schema:address',
      limit: 10,
      templates: {
        rowhead: ' {{image property="schema:image" fallback="/bild_saknas.jpg"}} <div class="info-card-header"><div class="cardList-title__art">{{text}}</div> <div class="cardList-title__date" {{text content="${dcterms:created}"}}></div></div> <div class="info-card-header"><div class="cardList-title__text" {{text  relation="dcterms:creator" content="${foaf:givenName} ${foaf:familyName}"}}></div>  <div class="cardList-title__text category" {{text  content="${schema:artform}"}}></div> </div>',
        listplaceholder: '<h3>No matching results</h3>',
      },
    },
  ],
};

const btnFilter = document.querySelector('.btn--filter--mobile');
const filterMobile = document.querySelector('.facets--mobile');
const btnClose = document.querySelector('.btn--close');

if (btnFilter) {
  btnFilter.onclick = () => {
    filterMobile.classList.toggle('hidden');
    console.log('clicked!');
  };
}

if (btnClose) {
  btnClose.onclick = () => {
    filterMobile.classList.toggle('hidden');
    console.log('closed!');
  };
}
