import m from 'mithril';
import jquery from 'jquery';
import 'selectize';
import registry from 'commons/registry';

/**
 * element : select like element allowing type-ahead search of entries
 *
 * allowNoEntry : true if the select should provide an explicit empty value in the dropdown
 * entrySearch : a function that takes a simple search string and provides a promise with entries back
 * entryToLabel : a function that maps an individual entry to a label, if not providedd the default
 *                label mechanism will be used.
 * onSelect : this function will be called upon select with the selected entry
 *
 * @type {{view: ((vnode))}}
 */
export default {
  oncreate(vnode) {
    // Attributes interface
    const {
      allowNoEntry,
      entrySearch,
      entryToLabel,
      onSelect,
    } = vnode.attrs;

    const settings = {
      valueField: 'value',
      labelField: 'label',
      searchField: 'label',
      allowEmptyOption: allowNoEntry === true,
      mode: 'single',
      closeAfterSelect: true,
      preload: 'focus',
      create: false,
      onItemAdd(value) {
        const es = registry.get('entrystore');
        if (value !== '' && value != null) {
          es.getEntry(value).then(onSelect);
        } else {
          onSelect(null);
        }
      },
    };

    settings.load = (query, callback) => {
      const rdfutils = registry.get('rdfutils');
      entrySearch(query).then((arr) => {
        if (entryToLabel) {
          callback(arr.map(entry => ({
            value: entry.getURI(),
            label: entryToLabel(entry),
          })));
        } else {
          callback(arr.map(entry => ({
            value: entry.getURI(),
            label: rdfutils.getLabel(entry) || '',
          })));
        }
      });
    };
    // Initialize after load function is added
    jquery(vnode.dom).selectize(settings);
  },
  view() {
    return m('input', { type: 'text' });
  },
};
