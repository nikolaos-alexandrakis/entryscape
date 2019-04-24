import escaApiProgress from 'catalog/nls/escaApiProgress.nls';
import escaFiles from 'catalog/nls/escaFiles.nls';
import escaManageFiles from 'catalog/nls/escaManageFiles.nls';
import TitleDialog from 'commons/dialog/TitleDialog';
import ListDialogMixin from 'commons/list/common/ListDialogMixin';
import registry from 'commons/registry';
import htmlUtil from 'commons/util/htmlUtil';
import declare from 'dojo/_base/declare';
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
    const res = this.refreshAPI();
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
    this.refreshAPI(); // return promise
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
  refreshAPI() {
    if (this.isFileDistributionWithAPI()) {
      const dialogs = registry.get('dialogs');
      const confirmMessage = this.NLSLocalized.escaManageFiles.refreshAPI;
      return dialogs.confirm(confirmMessage, null, null, async (confirm) => {
        if (confirm) {
          const apiDistEntry = await this._getApiDistributionEntry();

          const params = {
            filesURI: null,
            params: {
              apiDistEntry,
              distributionEntry: this.entry,
              datasetEntry: this.datasetEntry,
              mode: 'refresh',
              escaApiProgress: this.NLSLocalized.escaApiProgress,
              escaFiles: this.NLSLocalized.escaFiles,
            },
          };

          if (this.fileList.hasOnlyAddedFiles()) {
            params.filesURI = this.fileList.getAddedFileURIs();
          }

          /**
           * run the API pipeline
           */
          const generateAPI = new GenerateAPI();
          generateAPI.execute(params);
        }
      });
    }
    return null;
  },
});
