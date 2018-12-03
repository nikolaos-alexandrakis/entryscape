import declare from 'dojo/_base/declare';
import BaseList from './BaseList';
import Typeahead from '../../query/Typeahead';

export default declare([BaseList], {
  includeCreateButton: false,
  includeRefreshButton: true,
  searchInList: false,
  searchVisibleFromStart: false,
  Typeahead,

  postCreate() {
    this.inherited('postCreate', arguments);
    this.listView.headerContainerInner.style.display = 'none';
    this.listView.searchBlockInner.style.display = 'none';
    this.listView.typeaheadInput.style.display = '';
    this.listView.lowerBlock.style.display = '';

    this.typeahead = new this.Typeahead({}, this.getView().typeaheadInput);
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
