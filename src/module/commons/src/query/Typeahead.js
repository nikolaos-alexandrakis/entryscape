import registry from '../registry';
import jquery from 'jquery';
// require('typeahead.js'); // used via plugin on jquery
import './typeahead.css';
const rdfutils = registry.get('rdfutils');
/** @type {store/EntryStore} */
const es = registry.get('entrystore');
let counter = 0;

export default class {
  getLabel(entry) {
    return rdfutils.getLabel(entry) || entry.getId();
  }

  getQuery(str) {
    return es.newSolrQuery().title(str).limit(10).list();
  }

  render(entry) {
    return `<div class="entryscapeTypeahead" title="${
    rdfutils.getDescription(entry) || ''}">${
      this.getLabel(entry)}</div>`;
  }

  processEntries(entries, callback) {
    callback(entries.map(entry => ({id: entry.getURI(), name: this.getLabel(entry)})));
  }

  select() {
  }

  clear() {
    jquery(this.inputTag).typeahead('val', '');
  }

  setDisabled(disabled) {
    if (disabled) {
      this.inputTag.setAttribute('disabled', 'disabled');
    } else {
      this.inputTag.removeAttribute('disabled');
    }
  }

  // -------Below is constructor, private methods and private variables---------
  constructor(params, inputTag) {
    this.delay = 200;
    this.emptyMessage = 'No matching entries';
    this.inputTag = inputTag;
    const $inputTag = jquery(inputTag);
    $inputTag.typeahead({hint: false, highlight: true, minLength: 1},
      {
        name: `entryscape_typeahead_${counter}`,
        display: 'name',
        source: this._find.bind(this),
        templates: {
          empty: [
            '<div class="empty-message">',
            this.emptyMessage,
            '</div>',
          ].join('\n'),
          suggestion: this._render.bind(this),
        },
      });
    $inputTag.on('typeahead:select', this._select.bind(this));
    counter += 1;
  }

  _render(value) {
    return this.render(es.getCache().get(value.id));
  }

  _select(el, value) {
    this.select(es.getCache().get(value.id));
  }

  _find(query, syncResults, asyncResults) {
    clearTimeout(this.timeoutFunc);
    const f = (entryArr) => {
      this.processEntries(entryArr, asyncResults);
    };
    this.timeoutFunc = setTimeout(() => {
      this.getQuery(query).getEntries(0).then(f);
    }, this.delay);
  }
};
