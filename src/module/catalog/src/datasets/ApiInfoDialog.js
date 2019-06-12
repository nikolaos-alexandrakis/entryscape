import escaDataset from 'catalog/nls/escaDataset.nls';
import escaFiles from 'catalog/nls/escaFiles.nls';
import TitleDialog from 'commons/dialog/TitleDialog';
import htmlUtil from 'commons/util/htmlUtil';
import _WidgetsInTemplateMixin from 'dijit/_WidgetsInTemplateMixin';
import declare from 'dojo/_base/declare';
import { NLSMixin } from 'esi18n';
import template from './ApiInfoDialogTemplate.html';
import './escaApiInfo.css';
import pipelineUtil from './pipelineUtil';
import api from './utils/apiUtil';

export default declare([TitleDialog.Content, _WidgetsInTemplateMixin, NLSMixin.Dijit], {
  bid: 'escaApiInfo',
  templateString: template,
  nlsBundles: [{ escaFiles }, { escaDataset }],

  maxWidth: 800,
  nlsHeaderTitle: 'apiInfoDialogHeader',
  nlsFooterButtonLabel: 'apiInfoDialogCloseLabel',
  nlsFooterButtonTitle: 'apiInfoDialogfooterButtonTitle',
  includeFooter: false,
  title: 'apiInfoDialogTitle',

  postCreate() {
    this.inherited(arguments);
    // domClass.add(this.saveButton, 'disabled');
    // domClass.add(this.removeButton, 'disabled');
    this.removeButton.setAttribute('disabled', true);
    this.saveButton.setAttribute('disabled', true);
    let t;
    const checkAliasName = this.checkAliasName.bind(this);
    this.__aliasError.style.display = 'none';
    this.apiAlias.addEventListener('keyup', () => {
      if (t != null) {
        clearTimeout(t);
      }
      t = setTimeout(checkAliasName, 300);
    });
  },
  checkAliasName() {
    // TODO check allowed chars
    this.__aliasError.style.display = 'none';
    const aliasName = this.apiAlias.value;
    if (aliasName === '' || aliasName === this.currentAliasName) {
      this.saveButton.setAttribute('disabled', true);
    } else {
      const alphanum = /^[0-9a-zA-Z]+$/;
      if (!aliasName.match(alphanum)) {
        this.saveButton.setAttribute('disabled', true);
        this.__aliasError.style.display = '';
        this.__aliasError.innerHTML = this.NLSLocalized.escaDataset.invalidAliasName;
        return;
      }
      this.saveButton.removeAttribute('disabled');
    }
  },
  saveAlias() {
    const aliasName = this.apiAlias.value;
    pipelineUtil.setAlias(this.etlEntry, aliasName).then(() => {
      this.currentAliasName = aliasName;
      this.removeButton.removeAttribute('disabled');
      this._setAliasNameInExternalMetadata(aliasName);
      this._updateExampleURL(aliasName);
    }, (err) => {
      if (err && err.response.status === 400) {
        this.__aliasError.style.display = '';
        this.__aliasError.innerHTML = this.NLSLocalized.escaDataset.duplicateAliasName;
      }
    });
  },
  removeAlias() {
    pipelineUtil.removeAlias(this.etlEntry).then(() => {
      this.apiAlias.value = '';
      this.removeButton.setAttribute('disabled', true);
      this.currentAliasName = this.apiAlias.value;
      this._setAliasNameInExternalMetadata();
      this._updateExampleURL();
    });
  },
  localeChange() {
    this.dialog.updateLocaleStrings(this.NLSLocalized.escaDataset);
  },
  open(params) {
    /** @type store/Entry */
    this.etlEntry = params.etlEntry;
    /** @type store/Entry */
    this.apiDistributionEntry = params.apiDistributionEntry;
    // this.datasetEntry = params.datasetEntry;
    // this.currentAliasName = 'test';
    const rURI = this.etlEntry.getResourceURI();
    const apiId = rURI.substr(rURI.lastIndexOf('/') + 1, rURI.length);
    this.apiId.innerHTML = apiId;
    this.apiAlias.value = '';
    // domClass.add(this.removeButton, 'disabled');
    this.removeButton.setAttribute('disabled', true);
    this._clearRows();
    this.detectAPI();
    // domClass.add(this.saveButton, 'disabled');
    this.saveButton.setAttribute('disabled', true);
    this.__aliasError.style.display = 'none';
    this.dialog.show();
  },
  _clearRows() {
    this.apiColumnsTableBody.innerHTML = '';
  },
  _updateExampleURL(alias) {
    // http://localhost:8282/dataset/4df514c2-1669-4b96-b206-79f4cba606ea?first name=some_string_pattern
    let exampleURL;
    // const test = `${this.etlEntry.getResourceURI()}?${alias}=some_string_pattern`;
    if (alias) {
      const str = this.etlEntry.getResourceURI();
      exampleURL = str.substring(0, str.lastIndexOf('/') + 1) + alias;
      exampleURL = `${exampleURL}?${this.colName}=some_string_pattern`;
    } else {
      exampleURL = `${this.etlEntry.getResourceURI()}?${this.colName}=some_string_pattern`;
    }

    this.searchExampleLink.innerHTML = exampleURL;
    this.searchExampleLink.setAttribute('href', exampleURL);
  },
  _renderRows() {
    const stmts = this.etlEntry.getCachedExternalMetadata().find(null, 'store:pipelineResultColumnName');
    const cols = stmts.map(stmt => stmt.getValue());
    if (cols.length === 0) {
      this.apiStatus.innerHTML = this.NLSLocalized.escaFiles.apiNotConnected;
      this.apiInfo.style.display = 'none';
      this.__apiRefreshButton.style.display = '';
    } else {
      this.apiStatus.innerHTML = this.NLSLocalized.escaFiles.apiStatus_available;
      this.__apiRefreshButton.style.display = 'none';
      this.apiStatus.style.color = 'green';
      this.apiInfo.style.display = '';

      // getting alias Name
      this.colName = cols[0];
      const aliasName = this.etlEntry.getCachedExternalMetadata().findFirstValue(null, 'store:aliasName');
      if (aliasName) {
        this.apiAlias.value = aliasName;
        this.currentAliasName = aliasName;
        this._updateExampleURL(aliasName);
      } else {
        this._updateExampleURL();
      }
      if (this.currentAliasName) { // check for
        this.removeButton.removeAttribute('disabled');
      }
      /*
      const exampleURL = `${this.etlEntry.getResourceURI()}?${cols[0]}=some_string_pattern`;
      domAttr.set(this.searchExampleLink.innerHTML = exampleURL);
      domAttr.set(this.searchExampleLink, 'href', exampleURL);
       */
      cols.forEach((column) => {
        const tr = htmlUtil.create('tr', null, this.apiColumnsTableBody);
        htmlUtil.create('td', { innerHTML: column }, tr);
      });
    }
  },
  refreshAPIStatus() {
    this.detectAPI();
  },
  _setAliasNameInExternalMetadata(aliasName) {
    this.getAPIStatus().then((status) => {
      if (status === 'available') {
        api.updateAliasInEntry(this.etlEntry, aliasName);
      }
    });
  },
  async detectAPI() {
    this.__apiRefreshButton.style.display = 'none';
    this.apiInfo.style.display = '';
    this.apiStatus.style.color = 'black';
    const status = await this.getAPIStatus();
    const statusMessageKey = `apiStatus_${status}`;
    this.apiStatus.innerHTML = this.NLSLocalized.escaFiles[statusMessageKey];
    switch (status) {
      case 'error':
        this.apiStatus.style.color = 'red';
        this.apiInfo.style.display = 'none';
        this.__apiRefreshButton.style.display = 'none';
        break;
      case 'available':
        this.apiStatus.style.color = 'green';
        this.apiInfo.style.display = '';
        this._clearRows();
        this._renderRows();
        break;
      default:
        this.apiStatus.style.color = 'orange';
        this.__apiRefreshButton.style.display = '';
        this.apiInfo.style.display = 'none';
    }
  },
  async getAPIStatus() {
    return api.syncStatus(this.etlEntry.getURI(), true);
  },
});
