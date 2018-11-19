import DOMUtil from 'commons/util/htmlUtil';
import params from 'blocks/boot/params';
import registry from 'commons/registry';
import filter from 'blocks/utils/filter';
import { Entry } from 'store';
import utils from './utils';
import jquery from 'jquery';
import 'selectize';

const rdfutils = registry.get('rdfutils');

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
export default function (node, data, items) {
  node.classList.add('block_searchFilter');
  filter.guard(node, data.if);
  if (typeof data.width !== 'undefined') {
    node.style.width = data.width;
  }
  let urlParams = {};
  params.onInit((up) => {
    urlParams = up;
  });

  const input = DOMUtil.create('input', { type: 'text', placeholder: data.placeholder });
  node.appendChild(input);
  let selectize;
  let selectedOption;
  let lock = false;
  let clearOptions;

  const settings = {
    valueField: 'value',
    labelField: 'label',
    searchField: 'label',
    allowEmptyOption: data.allowEmptyOption !== false,
    mode: 'single',
    closeAfterSelect: true,
    preload: 'focus',
    create: false,
    onItemAdd(value) {
      const newOption = value !== '' ? selectize.options[value] : undefined;
      lock = true;
      filter.replace(selectedOption, newOption);
      if (!newOption) {
        clearOptions();
      }
      lock = false;
      selectedOption = newOption;
    },
    render: {
      option(d, escape) {
        const label = d.value === '' ? data.emptyLabel || '&nbsp;' : escape(d.label);
        const occurence = typeof d.occurence !== 'undefined' ? ` (${d.occurence})` : '';
        return `<div>${label}${occurence}</div>`;
      },
      item(d, escape) {
        if (d.value === '') {
          return `<div class="label--empty">${data.emptyLabel || data.placeholder || '&nbsp;'}</div>`;
        }
        return `<div>${escape(d.label)}</div>`;
      },
    },
  };

  const collectionName = `blocks_collection_${data.collection}`;
  settings.load = function (query, callback) {
    const collection = registry.get(collectionName);
    if (collection.type === 'search') {
      const es = registry.get('entrystore');
      const qo = es.newSolrQuery().publicRead();
      const context = (data.context === true ? urlParams.context : data.context)
          || collection.context;
      if (context) {
        qo.context(context);
      }
      if (collection.rdftype) {
        qo.rdfType(collection.rdftype);
      }
      const term = query.length ? query : '*';
      if (collection.searchproperty) {
        qo.literalProperty(collection.searchproperty, [term, `${term}*`]);
      } else {
        qo.title(term);
      }

      qo.limit(10).list().getEntries().then((arr) => {
        callback(arr.map(entry => ({
          value: entry.getResourceURI(),
          label: rdfutils.getLabel(entry),
          group: data.collection,
        })));
      }, () => {
        callback();
      });
    } else if (collection.list && collection.list.length > 0) {
      if (collection.list[0] instanceof Entry) {
        callback(collection.list.map(entry => ({
          value: entry.getResourceURI(),
          label: rdfutils.getLabel(entry),
          group: data.collection,
        })));
      } else {
        callback(collection.list);
      }
    } else if (collection.type === 'facet') {
      registry.get(collectionName, () => { // Why? we already have the collection...
        callback(collection.list);
      });
    }
  };
  // Initialize after load function is added
  selectize = jquery(input).selectize(settings)[0].selectize;

  clearOptions = () => {
    // const collection = registry.get(collectionName);
    if (selectize.getValue() === '') {
      Object.keys(selectize.options).forEach((o) => {
        if (o !== '') {
          selectize.removeOption(o);
        }
      });
      selectize.refreshOptions(false);
      selectize.loadedSearches = {};
    }
  };

  registry.onChange('blocks_search_filter', (filters) => {
    if (lock) {
      // If the filter is itself making the change
      return;
    }

    // Remove the value if it is not in the filters.
    if (!filters[data.collection] && selectedOption) {
      selectize.removeItem(selectedOption.value);
    }
    // Add value if it is in the filter
    utils.setValues(filters, data.collection, (item) => {
      lock = true;
      selectize.addOption(item);
      selectize.addItem(item.value, true);
      lock = false;
    });

    // Clear available options in some cases
    lock = true;
    clearOptions();
    lock = false;
  }, true);
}
