/* eslint-disable max-len */
/* eslint-disable no-template-curly-in-string */
window.__entryscape_config = {
  block: 'config',
  page_language: 'sv',
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
    'https://static.entryscape.com/suite/2.0.0/templates/rdfs',
    'https://static.entryscape.com/suite/2.0.0/templates/dc',
    'https://static.entryscape.com/suite/2.0.0/templates/schema',
    'https://opendata.statenskonstrad.se/theme_blocks/templates/skr',
  ],
  type2template: {
    'skr:Artist': 'skr:Artist',
    'http://www.cadastralvocabulary.org/CaLAThe/PropertyUnit': 'skr:PropertyUnit',
    'schema:PostalAddress': 'skr:PostalAddress',
  },
  minimumSearchLength: 2,
  query: {
    'metadata.object.literal': 3,
    'related.metadata.predicate.literal_t.ad967f07': 3, // schema:addressLocality
    'related.metadata.predicate.literal_t.6a9eb4d4': 3, // schema:addressRegion
    'related.metadata.predicate.literal_t.893797ba': 3, // foaf:name
    //    'metadata.predicate.literal_t.3f2ae919': 2,  // dcterms:title
    //    'metadata.predicate.literal_t.feda1d30': 2,  // dcterms:description
  },
  named: {
    'skr:indoors': { sv: 'Inomhus' },
    'skr:outdoors': { sv: 'Utomhus' },
  },
  collections: [
    {
      type: 'facet',
      name: 'title',
      label: 'Titel',
      property: 'dcterms:title',
      searchIndextype: 'text',
      appendWildcard: true,
      nodetype: 'literal',
      includeAsFacet: false,
    },
    {
      type: 'facet',
      name: 'artform',
      label: 'Huvudkategori',
      property: 'http://schema.org/artform',
      nodetype: 'literal',
      limit: 5,
      includeAsFacet: true,
    },
    {
      type: 'facet',
      name: 'environment',
      label: 'Miljö',
      property: 'https://opendata.statenskonstrad.se/terms/environment',
      nodetype: 'literal',
      limit: 5,
      includeAsFacet: true,
    },
    {
      type: 'facet',
      name: 'projectType',
      label: 'Projekttyp',
      property: 'https://opendata.statenskonstrad.se/terms/projectType',
      nodetype: 'literal',
      limit: 5,
      includeAsFacet: true,
    },
    {
      type: 'facet',
      name: 'county',
      label: 'Län',
      property: 'http://schema.org/addressRegion',
      nodetype: 'literal',
      related: true,
      limit: 5,
      includeAsFacet: true,
    },
    {
      type: 'facet',
      name: 'sex',
      label: 'Kön',
      property: 'foaf:gender',
      nodetype: 'literal',
      searchIndextype: 'text',
      related: true,
      limit: 5,
      includeAsFacet: true,
      vocab: {
        male: { sv: 'Man' },
        female: { sv: 'Kvinna' },
        km: { sv: 'Grupp' },
      },
    },
    {
      type: 'facet',
      name: 'situation',
      label: 'Läge',
      property: 'https://opendata.statenskonstrad.se/terms/situation',
      nodetype: 'uri',
      templatesource: 'skr:situation',
      limit: 5,
      includeAsFacet: true,
    },
    {
      type: 'facet',
      name: 'artist',
      label: 'Konstnär',
      property: 'foaf:name',
      related: true,
      nodetype: 'literal',
      context: '9',
      includeAsFacet: false,
    },
    {
      type: 'facet',
      name: 'site',
      label: 'Verksamhet',
      property: 'skr:site',
      nodetype: 'literal',
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
      limit: 5,
      context: '9',
      includeAsFacet: false,
    },
    {
      type: 'facet',
      name: 'address',
      label: 'Adress',
      property: 'schema:addressLocality',
      placeholder: 'Ort',
      related: true,
      nodetype: 'literal',
      searchIndextype: 'string',
      context: '9',
      includeAsFacet: false,
    },
    {
      type: 'facet',
      name: 'category',
      label: 'Underkategori',
      property: 'https://opendata.statenskonstrad.se/terms/subcategory',
      nodetype: 'literal',
      limit: 5,
      includeAsFacet: false,
    },
    {
      type: 'facet',
      name: 'date',
      label: 'Årtal',
      property: 'http://purl.org/dc/terms/created',
      nodetype: 'literal',
      includeAsFacet: false,
    },

  ],
  blocks: [
    {
      block: 'skrList',
      extends: 'searchList',
      rdftype: 'https://opendata.statenskonstrad.se/terms/WorkOfArt',
      define: 'mainList',
      context: '9',
      facets: true,
      headless: true,
      initsearch: true,
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

var btnFilter = document.querySelector('.btn--filter--mobile');
var filterMobile = document.querySelector('.facets--mobile');
var btnCloseFilter = document.querySelector('.close--filter');
var btnAdvancedSearch = document.querySelector('.noBtn');
var arrowAdvancedSearch = document.querySelector('.arrow--down');
var advancedSearch = document.querySelector('.advanced--group--wrapper');
var advancedMobile = document.querySelector('.advanced--mobile');
var btnAdvanced = document.querySelector('.btn--advanced--mobile');
var btnCloseAdvanced = document.querySelector('.close--advanced');

if (btnAdvancedSearch) {
  btnAdvancedSearch.onclick = function showAdvancedSearch() {
    advancedSearch.classList.toggle('active');
    arrowAdvancedSearch.classList.toggle('arrow--up');
  };
}

if (btnFilter) {
  btnFilter.onclick = function hideBtnFilter() { filterMobile.classList.toggle('hidden'); };
}

if (btnAdvanced) {
  btnAdvanced.onclick = function hideBtnAdvanced() { advancedMobile.classList.toggle('hidden'); };
}

if (btnCloseFilter) {
  btnCloseFilter.onclick = function closeFilter() { filterMobile.classList.toggle('hidden'); };
}

if (btnCloseAdvanced) {
  btnCloseAdvanced.onclick = function closeAdvanced() { advancedMobile.classList.toggle('hidden'); };
}

function scrollTop() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}
btnFilter.addEventListener('click', scrollTop);
btnAdvanced.addEventListener('click', scrollTop);
