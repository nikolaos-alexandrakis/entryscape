import registry from 'commons/registry';
import BaseList from 'commons/list/common/BaseList';
import TitleDialog from 'commons/dialog/TitleDialog';
import { NLSMixin } from 'esi18n';
import escoList from 'commons/nls/escoList.nls';
import escaFiles from 'catalog/nls/escaFiles.nls';
import declare from 'dojo/_base/declare';

const ns = registry.get('namespaces');

const SelectList = declare([BaseList], {
  includeCreateButton: false,
  includeInfoButton: true,
  includeEditButton: false,
  includeRemoveButton: false,
  includeHeadBlock: false,
  listInDialog: true,
  searchVisibleFromStart: true,
  nlsBundles: [{ escoList }, { escaFiles }],
  entryType: ns.expand('dcat:Dataset'),
  rowClickDialog: 'select',

  postCreate() {
    this.inherited('postCreate', arguments);
    this.getView().domNode.classList.remove('container');
  },
  showStopSign() {
    return false;
  },
  installButtonOrNot() {
    return true;
  },

  getTemplate() {
    if (!this.template) {
      this.template = registry.get('itemstore').getItem('dcat:OnlyDataset');
    }
    return this.template;
  },

  openDialog(dialogName, params) {
    if (dialogName === 'select') {
      this.detailsDialog.connectToDataset(params.row.entry);
      this.selectionDialog.hide();
    } else {
      this.inherited(arguments);
    }
  },

  getSearchObject() {
    const context = registry.get('context');
    /** @type {store/EntryStore} */
    const es = registry.get('entrystore');
    return es.newSolrQuery().rdfType(this.entryType).context(context.getResourceURI());
  },
});

export default declare([TitleDialog, NLSMixin.Dijit], {
  nlsHeaderTitle: 'connectToExistingDataset',
  includeFooter: false,
  nlsBundles: [{ escaFiles }],

  postCreate() {
    this.inherited(arguments);
    this.selectedList = new SelectList({ selectionDialog: this }, this.containerNode);
  },
  show(detailsDialog) {
    this.selectedList.detailsDialog = detailsDialog;
    this.selectedList.render();
    this.inherited(arguments);
  },
  localeChange() {
    this.updateLocaleStrings(escaFiles);
  },
});
