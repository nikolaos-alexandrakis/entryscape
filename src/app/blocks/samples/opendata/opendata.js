window.__entryscape_config = {
  block: 'config',
  namespaces: {
    ecpo: 'http://publications.europa.eu/resource/authority/',
  },
  named: { 'http://creativecommons.org/licenses/by/2.5/se/': { sv: 'Erkännande 2.5 Sverige (CC BY 2.5 SE)' },
    'http://creativecommons.org/licenses/by/2.5/se': { sv: 'Erkännande 2.5 Sverige (CC BY 2.5 SE)' },
    'http://www.creativecommons.se/om-cc/licenserna/': { sv: 'Någon CC licens' },
    'https://creativecommons.org/publicdomain/mark/1.0/': { sv: 'Public Domain Mark 1.0' },
    'https://opendatacommons.org/licenses/dbcl/1.0/': { sv: 'Database Contents License (DbCL) v1.0' },
    'https://trafiklab.se/api/gtfs-sverige-2/licens': { sv: 'GTFS Sverige 2 - Licens' },
    'https://trafiklab.se/api/oxyfi-realtidspositionering/licens': { sv: 'Oxyfi-Realtidspositionering - Licens' },
    'https://trafiklab.se/api/resrobot-reseplanerare/beskrivning/licens': { sv: 'ResRobot - Reseplanerare - Licens' },
    'https://trafiklab.se/api/resrobot-stolptidtabeller-2/licens': { sv: 'ResRobot - Stolptidtabeller 2 - Licens' },
    'https://trafiklab.se/api/sl-hallplatser-och-linjer-2/licens': { sv: 'SL Hållplatser och Linjer 2 - Licens' },
    'https://trafiklab.se/api/sl-narliggande-hallplatser/licens': { sv: 'SL Närliggande hållplatser - Licens' },
    'https://trafiklab.se/api/sl-platsuppslag/licens': { sv: 'SL Platsuppslag - Licens' },
    'https://trafiklab.se/api/sl-realtidsinformation-4/licens': { sv: 'SL Realtidsinformation 4 - Licens' },
    'https://trafiklab.se/api/sl-reseplanerare-2/licens': { sv: 'SL Reseplanerare 2 - Licens' },
    'https://trafiklab.se/api/sl-reseplanerare-3/licens': { sv: 'SL Reseplanerare 3 - Licens' },
    'https://trafiklab.se/api/sl-storningsinformation-2/licens': { sv: 'SL Störningsinformation 2 - Licens' },
    'https://trafiklab.se/api/sl-trafiklaget-2/licens': { sv: 'SL Trafikläget 2 - Licens' },
  },
  collections: [
    {
      type: 'search',
      name: 'org',
      label: 'Tillhandahållande organisation',
      property: 'dcterms:publisher',
      nodetype: 'uri',
      rdftype: ['foaf:Agent', 'foaf:Organization', 'foaf:Person'],
      limit: 7,
    },
    {
      type: 'search',
      name: 'cp',
      label: 'Kontakt',
      property: 'dcat:contactPoint',
      nodetype: 'uri',
      rdftype: ['vcard:Kind', 'vcard:Organization', 'vcard:Individual'],
      limit: 3,
      includeAsFacet: false,
    },
    {
      type: 'rdforms',
      name: 'theme',
      label: 'Tema',
      property: 'dcat:theme',
      nodetype: 'uri',
      templatesource: 'dcat:theme-isa',
    },
    {
      type: 'facet',
      name: 'keyword',
      label: 'Nyckelord',
      property: 'dcat:keyword',
      nodetype: 'literal',
      limit: 10,
    },
    {
      type: 'facet',
      name: 'access',
      label: 'Åtkomsträttigheter',
      property: 'dcterms:accessRights',
      nodetype: 'uri',
    },
    {
      type: 'facet',
      name: 'license',
      label: 'Licenser',
      property: 'dcterms:license',
      nodetype: 'uri',
      limit: 7,
    },
  ],
  type2template: {
    'skr:Artist': 'skr:Artist',
    'http://www.cadastralvocabulary.org/CaLAThe/PropertyUnit': 'skr:PropertyUnit',
    'schema:PostalAddress': 'skr:PostalAddress',
  },
  blocks: [
    {
      block: 'distributionList',
      extends: 'list',
      relation: 'dcat:distribution',
      template: 'dcat:OnlyDistribution',
      expandTooltip: 'Mer information',
      unexpandTooltip: 'Mindre information',
      listbody: '<div class="formats">{{body}}</div>',
      listplaceholder: '<div class="alert alert-info" role="alert">Denna datamängd har inga dataresurser' +
        ' angivna</div>',
      listhead: '<h4>Dataresurser</h4>',
      rowhead: '<div class="esbRowHead"><a href="{{prop "dcat:accessURL"}}" class="pull-right btn btn-sm btn-primary"' +
        ' role="button"' +
        ' target="_blank">' +
        '<i class="fa fa-external-link" aria-hidden="true"></i>&nbsp;Webbsida</a>' +
        '{{#ifprop "dcat:downloadURL"}}' +
        '<a href="{{prop "dcat:downloadURL"}}" class="pull-right btn btn-sm btn-default" role="button" target="_blank">' +
        '<i class="fa fa-download" aria-hidden="true"></i>&nbsp;Ladda ned</a>' +
        '{{/ifprop}}' +
        '<span class="label formatLabel label-success md5_{{prop "dcterms:format" render="md5"}}" ' +
        'title="{{prop "dcterms:format"}}">{{prop "dcterms:format" render="label"}}</span>' +
        '<span class="resourceLabel">{{text fallback="<span class=\\\'distributionNoName\\\'>Ingen titel' +
        ' given</span>"}}</span></div>',
    },
    {
      block: 'datasetView',
      extends: 'template',
      htemplate: '<h3>{{text}}</h3>' +
        '<div class="esbDescription">{{text content="${dcterms:description}"}}</div>' +
        '{{#ifprop "dcat:theme"}}' +
        '<h4>Tema: {{#eachprop "dcat:theme"}}<span class="esbTag md5_{{md5}}">{{label}}</span>{{/eachprop}}</h4>' +
        '{{/ifprop}}' +
        '{{#distributionList}}{{/distributionList}}' +
        '<h4>Ytterligare information</h4>\n' +
        '<div class="esbIndent">{{viewMetadata template="dcat:OnlyDataset" ' +
        'filterpredicates="dcterms:title,dcterms:description,dcat:theme"}}</div>\n',
    },
    {
      block: 'datasetList',
      extends: 'searchList',
      rdftype: 'dcat:Dataset',
      limit: '10',
      dependencyproperties: 'dcterms:publisher',
      listplaceholder: '<h4>Inga träffar</h4>',
      rowhead: '<div class="esbRowHead esbRowHead--large">' +
        '<h4>{{link namedclick="dataset"}}</h4>' +
        '<div class="esbDescription">{{text content="${dcterms:description}"}}</div></div>',
      rowexpand: '<div class="esbRowExpand">' +
        '{{#ifprop "dcat:theme"}}' +
        '<h4>Tema: {{#eachprop "dcat:theme"}}<span class="esbTag md5_{{md5}}">{{label}}</span>{{/eachprop}}</h4>' +
        '{{/ifprop}}' +
        '{{#distributionList}}{{/distributionList}}' +
        '<h4>Ytterligare information</h4>' +
        '<div class="esbIndent">{{viewMetadata template="dcat:OnlyDataset"' +
        ' filterpredicates="dcterms:title,dcterms:description,dcterms:publisher,dcat:theme"}}</div></div>',
    },
    {
      block: 'datasetSearch',
      extends: 'datasetList',
      facets: true,
      headless: true,
      rowhead: '<div class="esbRowHead esbRowHead--large">' +
        '<div class="esbRowHead--pullRight">{{link namedclick="datasets" clickkey="org" clickvalue="resource"' +
        ' relation="dcterms:publisher" define="org"}}</div>' +
        '<h4>{{link namedclick="dataset"}}</h4>' +
        '<div class="esbDescription">{{text content="${dcterms:description}"}}</div></div>',
    },
  ],
};
