import merge from 'commons/merge';
import adminConfig from 'admin/config/adminConfig';
import catalogConfig from 'catalog/config/catalogConfig';
import termsConfig from 'terms/config/termsConfig';
import workbenchConfig from 'workbench/config/workbenchConfig';
import { namespaces } from 'rdfjson';
import { queryToObject } from 'commons/util/browserUtil';
import query from 'dojo/query';
import { i18n } from 'esi18n';
import jquery from 'jquery';

const econfig = merge(window.__entryscape_plugin_config || {}, window.__entryscape_config || {});
econfig.blocks = econfig.blocks || window.__entryscape_blocks;
econfig.macros = window.__entryscape_macros || {};
if (econfig.page_language) {
  i18n.setLocale(econfig.page_language);
}
const hash = window.location.hash.substr(1);
const urlParams = {};
if (hash !== '') {
  const prefix = econfig.hashParamsPrefix || 'esc_';
  up = queryToObject(hash);
  for (const key in up) {
    if (up.hasOwnProperty(key)) {
      if (key.indexOf(prefix) === 0) {
        urlParams[key.substr(prefix.length)] = up[key];
      }
    }
  }
}
let entrystore = econfig.entrystore_base || econfig.entrystore;
let entitytypes = {};
let bundles = [];
let labelProperties;

const fixStuff = function (obj) {
  if (obj.namespaces) {
    namespaces.add(obj.namespaces);
  }
  if (obj.labelProperties) {
    labelProperties = obj.labelProperties;
  }

  if (obj.entrystore != null) {
    entrystore = obj.entrystore;
  }
  if (obj.entry != null) {
    econfig.entry = obj.entry;
  }
  if (obj.context != null) {
    econfig.context = obj.context;
  }
  if (obj.bundles != null) {
    if (typeof obj.bundles === 'string') {
      bundles = obj.bundles.split(',');
    } else if (Array.isArray(obj.bundles)) {
      bundles = obj.bundles;
    }
  }
  if (obj.entitytypes != null) {
    entitytypes = obj.entitytypes;
  }
  if (obj.type2template != null) {
    Object.keys(obj.type2template).forEach((t) => {
      entitytypes[t] = { rdfType: namespaces.expand(t), template: obj.type2template[t] };
    });
  }
};
fixStuff(econfig);
//    jquery("<div id='entryscape_dialogs' class='entryscape'>").appendTo(jquery('body'));
let nodes = query('*[data-entryscape],*[data-entryscape-block],script[type="text/x-entryscape-json"],script[type="text/x-entryscape-handlebar"]');
nodes = nodes.map((node) => {
  const inmap = jquery(node).data();
  let outmap = {};
  if (typeof inmap.entryscape === 'string') {
    outmap.block = inmap.entryscape;
    inmap.entryscape = true;
  }
  if (!inmap.entryscape && inmap.entryscapeBlock) {
    inmap.entryscape = true;
  }
  if (typeof inmap.entryscape === 'object') {
          // As json in one param
    outmap = inmap.entryscape;
  } else if (inmap.entryscape === true) {
    for (const key in inmap) {
      if (inmap.hasOwnProperty(key)
                    && key.indexOf('entryscape') === 0 && key.length > 10) {
        outmap[key[10].toLowerCase() + key.substr(11)] = inmap[key];
      }
    }
  } else {
    outmap.error = 'Wrong parameter value in entryscape trigger attribute, must either be boolean true or an json string';
    outmap.errorCode = 1;
    outmap.errorCause = inmap.entryscape;
  }

  if (outmap.extend && econfig.macros[outmap.extend]) {
    outmap = merge(econfig.macros[outmap.extend], outmap);
  }

  const scripttype = jquery(node).attr('type');
  if (scripttype === 'text/x-entryscape-json') {
    const datastr = jquery(node).html();
    try {
      outmap = JSON.parse(datastr);
    } catch (e) {
      outmap.error = `Expression inside script tag with type "text/x-entryscape-json" is not valid json: ${e}`;
      outmap.errorCode = 2;
      outmap.errorCause = datastr;
    }
    if (!outmap.block && !outmap.component) {
      outmap.block = 'config';
    }
  } else if (scripttype === 'text/x-entryscape-handlebar') {
    outmap.htemplate = jquery(node).html();
    if (!outmap.block && !outmap.component) {
      outmap.block = 'template';
    }
  } else {
    jquery(node).addClass('entryscape');
  }

  fixStuff(outmap);
  return {
    node: jquery(node).is('script') ? jquery('<span>').addClass('entryscape')
                .insertAfter(node)[0] : node,
    data: outmap,
  };
});

const config = merge(adminConfig, catalogConfig, termsConfig, workbenchConfig, {
  theme: {
    appName: 'EntryScape',
    oneRowNavbar: false,
    localTheme: false,
  },
  rdf: {
    namespaces: {
      dcat: 'http://www.w3.org/ns/dcat#',
    },
    labelProperties,
  },
  locale: {
    fallback: 'en',
    supported: [
                { lang: 'en', flag: 'gb', label: 'English', labelEn: 'English' },
                { lang: 'sv', flag: 'se', label: 'Svenska', labelEn: 'Swedish' },
    ],
  },
  itemstore: {
    '!bundles': [
      'templates/skos/skos',
      'templates/dcterms/dcterms',
      'templates/foaf/foaf',
      'templates/vcard/vcard',
      'templates/odrs/odrs',
      'templates/dcat-ap/dcat-ap_props',
      'templates/dcat-ap/dcat-ap',
      'templates/entryscape/esc',
    ],
    '!choosers': [
      'entryscape-commons/rdforms/EntryChooser',
    ],
  },
  entitytypes,
  site: null,
}, { urlParams,
  entrystore: { repository: entrystore, authentification: false },
  itemstore: { bundles },
  nodes,
  econfig });
if (entrystore) {
  namespaces.add('base', `${entrystore}/`);
}

let bestlang;
for (let i = 0; i < config.locale.supported.length; i++) {
  const l = config.locale.supported[i].lang;
  if (i18n.getLocale().indexOf(l) === 0) {
    if (bestlang == null || bestlang.length < l.length) {
      bestlang = l;
    }
  }
}

if (bestlang) {
  i18n.setLocale(bestlang);
} else {
  i18n.setLocale(config.locale.fallback);
}
    // TODO @scazan ask @matthias about this
    // kernel._scopeName = 'dojo1';
    // kernel.dijit._scopeName = 'dijit1';

export default config;
