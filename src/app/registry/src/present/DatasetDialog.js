import registry from 'commons/registry';
import htmlUtil from 'commons/util/htmlUtil';
import TitleDialog from 'commons/dialog/TitleDialog'; // In template
import Dataset from './Dataset';

define([
  'dojo/_base/declare',
], declare => declare([TitleDialog], {
  includeFooter: false,
  postCreate() {
    this.inherited(arguments);
    this.dataset = new Dataset({}, htmlUtil.create('div', null, this.containerNode));
  },
  open(params) {
    this.entry = params.row.entry;
    this.dataset.graph = registry.get('clipboardGraph');
    this.dataset.showDataset(params.row.entry);
    this.titleNode.innerHTML = registry.get('rdfutils').getLabel(this.entry);
    this.show();
  },
}));
