import DOMUtil from 'commons/util/htmlUtil';
import { namespaces } from 'rdfjson';
import 'selectize';
import jquery from 'jquery';
import filter from 'blocks/utils/filter';
import params from 'blocks/boot/params';
import registry from 'commons/registry';
import utils from './utils';

const rdfutils = registry.get('rdfutils');
const termFilter = (arr, term) => {
  if (term.length > 0) {
    return arr.filter(val => (val.label || '').toLowerCase().indexOf(term.toLowerCase()) > -1);
  }
  return arr;
};

/**
 * Renders a dropdown filter with typeahead functionality.
 * Selected values will be used by the "search" component (renderSearchList) as constraints.
 *
 * Depending on the parameters provided it works a bit differently:
 *   rdftype - requests will be made to entrystore to retrieve all entries with this type
 *   context - restrict a search to the specified context,
 *             if set to "true" it uses the context from the urlParams.
 *   collection - name of a collection from where values will be taken,
 *              the collection is typically provided via a preloaded component
 *   property - the property to filter the selected values with.
 *   literal - true if the values are to be considered literals.
 */
export default function (node, data) {
  let lock = false;
  if (typeof data.width !== 'undefined') {
    node.style.width = data.width;
  }
  let urlParams = {};
  params.onInit((up) => {
    urlParams = up;
  });

  const collections = registry.get('blocks_collections');
  const name2col = {};
  collections.forEach((col) => {
    name2col[col.name] = col;
  });

  let selectize;
  const localItems = {};
  const settings = {
    valueField: 'value',
    labelField: 'label',
    searchField: 'label',
    optgroupValueField: 'name',
    optgroupLabelField: 'label',
    optgroups: collections,
    optgroupField: 'group',
    mode: 'multi',
    openOnFocus: false,
    closeAfterSelect: true,
    preload: 'focus',
    create: true,
    addPrecedence: true,
    persist: false,
    onItemAdd(value) {
      if (lock) {
        selectize.close();
        return;
      }
      const item = selectize.options[value];
      localItems[value] = item;
      lock = true;
      filter.add(item);
      if (data.click) {
        const urlParams = {};
        let click = data.click;
        const col = item.group && name2col[item.group] ? name2col[item.group] : {};
        if (col.click) {
          click = name2col[item.group].click;
        }
        const shortenedValue = namespaces.shortenKnown(item.value);
        if (col.linkparam) {
          switch (col.linkparam) {
            case 'entry':
              if (item.eid && item.cid && col.linkparam) {
                urlParams.entry = item.eid;
                urlParams.context = item.cid;
              }
              urlParams.entry = item.eid;
              urlParams.context = item.cid;
              break;
            case 'group':
              urlParams[item.group] = shortenedValue;
              break;
            default:
              urlParams[col.linkparam] = shortenedValue;
          }
        } else {
          urlParams[item.group || 'term'] = shortenedValue;
          if (item.eid && item.cid) {
            urlParams.entry = item.eid;
            urlParams.context = item.cid;
          }
        }
        params.setLocation(click || '', urlParams);
      }
      lock = false;
      selectize.close();
    },
    onItemRemove(value) {
      if (lock) {
        selectize.close();
        return;
      }
      const option = localItems[value];
      delete localItems[value];
      lock = true;
      filter.remove(option || { value });
      lock = false;
      selectize.close();
    },
    render: {
      option(data, escape) {
        if (data.free) {
          return `<div>Search for ${escape(data.label)}</div>`;
        }
        return `<div>${escape(data.label)}</div>`;
      },
      item(data, escape) {
        const item = DOMUtil.create('div', { class: 'item' }); // TODO  import this when defines are removed
        if (data.group && data.group !== 'term') {
          item.appendChild(DOMUtil.create(
            'span', {
              class: 'group',
              innerHTML: `${name2col[data.group].label}:`,
            },
          ));
        }
        item.appendChild(DOMUtil.create('span', { class: 'itemLabel', innerHTML: escape(data.label) }));

        const faRemoveIconEl = DOMUtil.create('i', { class: 'fas fa-times' });
        faRemoveIconEl.onclick = () => {
          selectize.removeItem(data.value);
        };
        item.appendChild(faRemoveIconEl);

        return item;
      },
      option_create(data, escape) {
        return `<div class="create">Search for "${escape(data.input)}"</div>`;
      },
    },
  };

  const input = DOMUtil.create('input', {
    type: 'text',
    placeholder: data.placeholder || 'Search for...',
  });
  node.appendChild(input);
  const loads = collections.map(def => (query) => {
    if (def.type === 'search') {
      const es = registry.get('entrystore');
      const qo = es.newSolrQuery().publicRead();
      const contextId = def.context || (data.context === true ? urlParams.context : data.context);
      if (contextId) {
        qo.context(contextId);
      }
      if (def.rdftype) {
        qo.rdfType(def.rdftype);
      }
      const term = query.length > 0 ? query : '*';
      if (def.searchproperty) {
        qo.literalProperty(def.searchproperty, term);
      } else {
        qo.title(term);
      }

      return qo.limit(6).list().getEntries().then(arr => arr.map(entry => ({
        value: entry.getResourceURI(),
        eid: entry.getId(),
        cid: entry.getContext().getId(),
        label: rdfutils.getLabel(entry),
        group: def.name,
      })));
    }
    return new Promise((resolve) => {
      registry.get(`blocks_collection_${def.name}`);
      return resolve(termFilter(def.list || [], query));
    });
  });

  settings.load = (query, callback) => {
    Promise.all(loads.map(ld => ld(query))).then((searchResults) => {
      const results = [];
      let pos = 0;
      let left = true;
      while (results.length < 20 && left) {
        left = false;
        searchResults.forEach((arr) => {
          const v = arr[pos];
          if (v) {
            left = true;
            if (v.label.toLowerCase().indexOf(query.toLowerCase()) !== -1) {
              results.push(v);
            }
          }
        });
        pos += 1;
      }
      // Set input as hidden to avoid trigger of dropdown on initial load
      selectize.isInputHidden = true;
      callback(results);
      selectize.isInputHidden = false;
    });
  };

  // Initialize after load function is added
  selectize = jquery(input).selectize(settings)[0].selectize;

  // Listen in and update search field if other parts of the ui changes the filter
  registry.onChange('blocks_search_filter', (filters) => {
    if (lock) {
      // If selectize is itself making the change
      return;
    }
    const setItem = (item) => {
      lock = true;
      selectize.addOption(item);
      localItems[item.value] = item;
      selectize.addItem(item.value, true);
      lock = false;
    };
    Object.keys(filters).forEach((group) => {
      utils.setValues(filters, group, setItem);
    });
    selectize.items.slice(0).forEach((value) => {
      const item = selectize.options[value];
      const filt = filters[item.group || 'term'] || [];
      if (!filt.find(fival => fival.value === item.value)) {
        delete localItems[item.value];
        selectize.removeItem(item.value, true);
      }
    });
    lock = false;
  }, true);
}
