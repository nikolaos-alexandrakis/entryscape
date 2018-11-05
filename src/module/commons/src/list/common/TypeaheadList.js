import BaseList from './BaseList';
import Typeahead from '../../query/Typeahead';

import declare from 'dojo/_base/declare';

export default declare([BaseList], {
  includeCreateButton: false,
  includeRefreshButton: true,
  searchInList: false,
  searchVisibleFromStart: false,
  typeaheadClass: Typeahead,

  postCreate() {
    this.inherited('postCreate', arguments);
    this.listView.headerContainerInner.style.display = 'none';
    this.listView.searchBlockInner.style.display = 'none';
    this.listView.typeaheadInput.style.display = '';
    this.listView.lowerBlock.style.display = '';

    const Cls = this.typeaheadClass;
    this.typeahead = new Cls({}, this.getView().typeaheadInput);
    const methods = ['select', 'getLabel', 'getQuery', 'render', 'processEntries'];
    for (let i = 0; i < methods.length; i++) {
      const method = methods[i];
      if (this[`typeahead_${method}`]) {
        this.typeahead[method] = this[`typeahead_${method}`].bind(this);
      }
    }
  },
  typeahead_select(entry) {
    this.typeahead.clear();
    this.addRowForEntry(entry);
  },
});
