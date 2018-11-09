import registry from 'commons/registry';
import DatasetDialog from 'catalog/public/DatasetDialog';
import BaseList from 'commons/list/common/BaseList';
import ListView from 'commons/list/ListView';
import escoList from 'commons/nls/escoList.nls';
import escaDataset from 'catalog/nls/escaDataset.nls';
import declare from 'dojo/_base/declare';

const ns = registry.get('namespaces');

export default declare([BaseList], {
  includeCreateButton: false,
  includeInfoButton: true,
  includeEditButton: false,
  includeRemoveButton: false,
  includeHead: true,
  includeResultSize: false,
  searchVisibleFromStart: true,
  nlsBundles: [{ escoList }, { escaDataset }],
  entryType: ns.expand('dcat:Dataset'),
  listViewClass: ListView,
  class: 'datasets',
  rowClickDialog: 'info',
  nlsEmptyListWarningKey: 'emptyListWarningForSearch',
  postCreate() {
    this.inherited('postCreate', arguments);
    this.registerDialog('info', DatasetDialog);
    this.listView.includeResultSize = !!this.includeResultSize; // make this boolean
  },
  showStopSign() {
    return false;
  },
  installButtonOrNot() {
    return true;
  },
  getIconClass() {
    return 'search';
  },
  getTemplate() {
    if (!this.template) {
      this.template = registry.get('itemstore').getItem(config.catalog.datasetTemplateId);
    }
    return this.template;
  },
  getSearchObject() {
    const so = registry.get('entrystore').newSolrQuery().rdfType(this.entryType);
    const context = registry.get('context');
    if (context) {
      so.context(context);
    }
    return so;
  },
});
