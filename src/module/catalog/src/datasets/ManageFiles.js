import registry from 'commons/registry';
import ListDialogMixin from 'commons/list/common/ListDialogMixin';
import TitleDialog from 'commons/dialog/TitleDialog';
import htmlUtil from 'commons/util/htmlUtil';
import declare from 'dojo/_base/declare';
import escaManageFiles from 'catalog/nls/escaManageFiles.nls';
import escaFiles from 'catalog/nls/escaFiles.nls';
import escaApiProgress from 'catalog/nls/escaApiProgress.nls';
import FilesList from './FilesList';
import GenerateAPI from './GenerateAPI';
import template from './ManageFilesTemplate.html';

export default declare([TitleDialog.ContentNLS, ListDialogMixin], {
  templateString: template,
  maxWidth: 800,
  nlsBundles: [{ escaManageFiles }, { escaFiles }, { escaApiProgress }],
  nlsHeaderTitle: 'manageFilesHeader',
  nlsFooterButtonLabel: 'manageFilesFooterButton',
  includeFooter: true,

  postCreate() {
    this.inherited(arguments);
    this.dialog.conditionalHide = () => {
      this.conditionalHide();
    };
  },
  open(params) {
    this.inherited(arguments);
    this.entry = params.entry;
    this.datasetEntry = params.datasetEntry;
    this.apiEntryURIs = params.fileEntryApiURIs;
    if (this.fileList) {
      this.fileList.destroy();
      delete this.fileList;
    }
    const listNode = htmlUtil.create('div', null, this.__filesList);
    this.filesCount = this.getFilesCount();
    this.fileList = new FilesList({ entry: this.entry, parentRow: params.distributionRow },
      listNode);
    this.fileList.show();
    this.dialog.show();
  },
  getFilesCount() {
    const fileStmts = this.entry.getMetadata().find(this.entry.getResourceURI(), 'dcat:downloadURL');
    return fileStmts.length;
  },
  isFileDistributionWithAPI() { // api distribution dct:source fileDistributionResourceURI
    return this.apiEntryURIs.indexOf(this.entry.getResourceURI()) > -1;
  },
  conditionalHide() {
    if (!this.fileList.isListUpdated()) {
      this.dialog.hide();
      return;
    }

    // TODO seems like unnecessary code, just this.dialogHide() should do?
    const res = this.reActivateAPI();
    if (res) {
      this.dialog.hide();
    } else if (typeof res === 'undefined') {
      this.dialog.hide();
    }

    this.dialog.hide();
  },
  footerButtonAction() {
    if (!this.fileList.isListUpdated()) {
      return;
    }
    this.reActivateAPI();// return promise
  },
  _getApiDistributionEntry() {
    const es = registry.get('entrystore');
    const esu = registry.get('entrystoreutil');
    const list = es.newSolrQuery()
      .rdfType('dcat:Distribution')
      .uriProperty('dcterms:source', this.entry.getResourceURI())
      .limit(1)
      .list();
    return list.getEntries().then(distEntries => esu.getEntryByResourceURI(distEntries[0].getResourceURI()));
  },
  reActivateAPI() {
    if (this.isFileDistributionWithAPI()) {
      const dialogs = registry.get('dialogs');
      const confirmMessage = this.NLSBundle0.reActivateAPI;
      return dialogs.confirm(confirmMessage, null, null, (confirm) => {
        if (confirm) {
          this._getApiDistributionEntry().then((apiDistrEntry) => {
            const generateAPI = new GenerateAPI();
            generateAPI.show({
              apiDistrEntry,
              distributionEntry: this.entry,
              datasetEntry: this.datasetEntry,
              mode: 'edit',
              escaApiProgress: this.NLSBundles.escaApiProgress,
              escaFiles: this.NLSBundles.escaFiles,
            });
          });
        }
      });
    }
    return null;
  },
});
