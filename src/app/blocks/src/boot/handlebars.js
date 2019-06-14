import block from 'blocks/boot/block';
import handlebars from 'handlebars/dist/cjs/handlebars';
import jquery from 'jquery';
import md5 from 'md5';
import { namespaces } from 'rdfjson';
import registry from 'commons/registry';
import error from 'blocks/boot/error';

let currentEntry;
const idx = [];
let counter = 0;
let bodycomponentId;
let group = {};

['rowhead', 'rowexpand', 'listempty', 'listhead', 'listbody', 'listplaceholder'].forEach((name) => {
  handlebars.registerHelper(name, (options) => {
    group[name] = options.fn();
  });
});

let initializeHelpers = () => {
  block.list.forEach((name) => {
    handlebars.registerHelper(name, (options) => {
      counter += 1;
      const id = `_ebh_${counter}`;
      const obj = {
        id,
        component: name,
        options,
      };

      idx[idx.length - 1][id] = obj;

      if (name === 'template') {
        options.hash.htemplate = options.fn();
      } else if (typeof options.fn === 'function') {
        group = {};
        options.fn();
        obj.templates = group;
      }
      return new handlebars.SafeString(`<span id="${id}"></span>`);
    });
  });
  handlebars.registerHelper('body', () => {
    counter += 1;
    bodycomponentId = `_ebh_${counter}`;
    return new handlebars.SafeString(`<span id="${bodycomponentId}"></span>`);
  });
  handlebars.registerHelper('ifprop', (prop, options) => {
    const subject = !options.hash.nested ? currentEntry.getResourceURI() : undefined;
    const props = prop.split(',');
    const stmts = [];
    props.forEach((p) => {
      const propStmts = currentEntry.getMetadata().find(subject, p);
      stmts.push(...propStmts);
    });
    const invert = options.hash.invert != null;
    if (options.hash.uri || options.hash.literal) {
      const found = stmts.find((stmt) => {
        if (options.hash.uri) {
          return stmt.getValue() === namespaces.expand(options.hash.uri);
        }
        return stmt.getValue() === options.hash.literal;
      });
      if ((found && !invert) || (!found && invert)) {
        return options.fn(options.data);
      }
    } else if ((stmts.length > 0 && !invert) || (stmts.length === 0 && invert)) {
      return options.fn(options.data);
    }

    return null;
  });
  handlebars.registerHelper('eachprop', (prop, options) => {
    const subject = !options.hash.nested ? currentEntry.getResourceURI() : undefined;
    const stmts = currentEntry.getMetadata().find(subject, prop);
    const val2choice = registry.get('itemstore_choices');
    const val2named = registry.get('blocks_named');
    const localize = registry.get('localize');
    const es = registry.get('entrystore');
    const rdfutils = registry.get('rdfutils');
    const ret = stmts.map((stmt) => {
      const val = stmt.getValue();
      const choice = val2choice[val];
      let label;
      let desc;
      let regexp = '';
      if (choice && choice.label) {
        label = localize(choice.label);
      } else if (stmt.getType() === 'uri') {
        if (val2named[val]) {
          label = localize(val2named[val]);
        } else {
          const entryArr = Array.from(es.getCache().getByResourceURI(val));
          if (entryArr.length > 0) {
            label = rdfutils.getLabel(entryArr[0]);
          }
        }
      }
      if (options.hash.regexp) {
        try {
          regexp = (val.match(new RegExp(options.hash.regexp)) || ['', ''])[1];
        } catch (regExpError) {
          // Do nothing
        }
      }
      if (choice && choice.description) {
        desc = localize(choice.description);
      }
      return options.fn({
        value: val,
        md5: md5(val),
        type: stmt.getType(),
        language: stmt.getLanguage(),
        lang: stmt.getLanguage(),
        datatype: stmt.getDatatype(),
        regexp,
        label: label || val,
        description: desc || '',
      });
    });
    return ret.join('');
  });
  handlebars.registerHelper('resourceURI', () => currentEntry.getResourceURI());
  handlebars.registerHelper('metadataURI', () => currentEntry.getEntryInfo().getMetadataURI());
  handlebars.registerHelper('entryURI', () => currentEntry.getURI());

  handlebars.registerHelper('prop', (prop, options) => {
    const subject = !options.hash.nested ? currentEntry.getResourceURI() : undefined;
    const stmts = currentEntry.getMetadata().find(subject, prop);
    if (stmts.length === 0) {
      return '';
    }
    const val = stmts[0].getValue();
    if (options.hash.regexp) {
      try {
        return (val.match(new RegExp(options.hash.regexp)) || ['', ''])[1];
      } catch (RegExpError) {
        // Do nothing
      }
    }

    const val2choice = registry.get('itemstore_choices');
    const choice = val2choice[val];
    switch (options.hash.render) {
      case 'label':
        if (choice && choice.label) {
          return registry.get('localize')(choice.label);
        }
        break;
      case 'description':
      case 'desc':
        if (choice && choice.label) {
          return registry.get('localize')(choice.description);
        }
        break;
      case 'type':
        return stmts[0].getType();
      case 'language':
      case 'lang':
        return stmts[0].getLanguage();
      case 'datatype':
        return stmts[0].getDatatype();
      case 'md5':
        return md5(val);
      default:
        break;
    }
    return new handlebars.SafeString(val.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/(\r\n|\r|\n)/g, '<br/>'));
  });
  handlebars.registerHelper('helperMissing', (options) => {
    throw new Error(`No helper for tag: ${options.name}`);
  });

  // Make sure this is only run once by emptying the function after first run
  initializeHelpers = () => {};
};

const parseValues = (obj, parentObj) => {
  const nobj = {};
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (typeof value === 'string') {
      if (value.indexOf('inherit') === 0) {
        const useKey = value.split(':').length === 1 ? key : value.split(':')[1];
        if (parentObj[useKey]) {
          nobj[key] = parentObj[useKey];
        }
      } else if (value[0] === '{' || value[0] === '[') {
        try {
          nobj[key] = JSON.parse(value);
        } catch (e) {
          // Do nothing
        }
      } else {
        nobj[key] = obj[key];
      }
    }
  });
  return nobj;
};

export default {
  unGroup(template) {
    idx.push({});
    group = {};
    handlebars.compile(template)({});
    idx.pop();
    return group;
  },
  /**
   * @param {Node} node - Node to insert into.
   * @param {object} data - Data for template rendering.
   * @param {Store/Entry} entry - Data for template rendering.
   * @param {boolean} body - not sure yet
   *
   */
  run(node, data, template, entry, body) {
    // register handlebars helpers only once
    initializeHelpers();

    const runAllBlocksInTemplate = () => {
      idx.push({});
      let handlebarTemplate;

      try {
        handlebarTemplate = handlebars.compile(template || data.htemplate || data.template,
          { data: { strict: true, knownHelpersOnly: true } });
        node.innerHTML = handlebarTemplate(data);
      } catch (e) {
        data.error = e.toString();
        data.errorCode = 4;
        data.errorCause = template || data.htemplate;
        error(node, data);
        return;
      }

      const cidx = idx.pop();
      Object.keys(cidx).forEach((id) => {
        const ob = cidx[id];
        const obj = {
          ...{ templates: ob.templates, entry: data.entry, context: data.context },
          ...parseValues(ob.options.hash || {}, data),
          ...{ block: ob.block || ob.component },
        };

        const attachNode = jquery(node).find(`#${ob.id}`)[0];
        block.run(ob.component, attachNode, obj);
      });
    };

    if (body) {
      runAllBlocksInTemplate();
      return jquery(node).find(`#${bodycomponentId}`)[0];
    }
    currentEntry = entry;
    runAllBlocksInTemplate();

    return null;
  },
};
