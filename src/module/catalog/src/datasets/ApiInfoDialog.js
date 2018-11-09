import TitleDialog from 'commons/dialog/TitleDialog';
import htmlUtil from 'commons/util/htmlUtil';
import { NLSMixin } from 'esi18n';
import escaFiles from 'catalog/nls/escaFiles.nls';
import escaDataset from 'catalog/nls/escaDataset.nls';
import declare from 'dojo/_base/declare';
import _WidgetsInTemplateMixin from 'dijit/_WidgetsInTemplateMixin';
import api from './api';
import pipelineUtil from './pipelineUtil';
import template from './ApiInfoDialogTemplate.html';
import './escaApiInfo.css';

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
      // domClass.add(this.saveButton, 'disabled');
      this.saveButton.setAttribute('disabled', true);
    } else {
      const alphanum = /^[0-9a-zA-Z]+$/;
      if (!aliasName.match(alphanum)) {
        // domClass.add(this.saveButton, 'disabled');
        this.saveButton.setAttribute('disabled', true);
        this.__aliasError.style.display = '';
        this.__aliasError.innerHTML = this.NLSBundles.escaDataset.invalidAliasName;
        return;
      }
      // domClass.remove(this.saveButton, 'disabled');
      this.saveButton.setAttribute('disabled', false); // maybe remove the attribute completely?
    }
  },

  saveAlias() {
    const aliasName = this.apiAlias.value;
    pipelineUtil.setAlias(this.etlEntry, aliasName).then(() => {
      this.currentAliasName = aliasName;
      this.removeButton.setAttribute('disabled', false); // maybe remove the attribute completely?
      this._setAliasNameInExternalMetadata(aliasName);
      this._updateExampleURL(aliasName);
    }, (err) => {
      if (err && err.response.status === 400) {
        this.__aliasError.style.display = '';
        this.__aliasError.innerHTML = this.NLSBundles.escaDataset.duplicateAliasName;
      }
    });
  },
  removeAlias() {
    pipelineUtil.removeAlias(this.etlEntry).then(() => {
      this.apiAlias.setAttribute('value', '');
      this.removeButton.setAttribute('disabled', true);
      this.currentAliasName = this.apiAlias.value;
      this._setAliasNameInExternalMetadata();
      this._updateExampleURL();
    });
  },
  localeChange() {
    this.dialog.updateLocaleStrings(this.NLSBundles.escaDataset);
  },
  open(params) {
    this.etlEntry = params.etlEntry;
    this.apiDistributionEntry = params.apiDistributionEntry;
    // this.datasetEntry = params.datasetEntry;
    // this.currentAliasName = 'test';
    const rURI = this.etlEntry.getResourceURI();
    const apiId = rURI.substr(rURI.lastIndexOf('/') + 1, rURI.length);
    this.apiId.innerHTML = apiId;
    this.apiAlias.setAttribute('value', '');
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
      this.apiStatus.innerHTML = this.NLSBundles.escaFiles.apiNotConnected;
      this.apiInfo.style.display = 'none';
      this.__apiRefreshButton.style.display = '';
    } else {
      this.apiStatus.innerHTML = this.NLSBundles.escaFiles.apiStatus_available;
      this.__apiRefreshButton.style.display = 'none';
      this.apiStatus.style.color = 'green';
      this.apiInfo.style.display = '';

      // getting alias Name
      this.colName = cols[0];
      const aliasName = this.etlEntry.getCachedExternalMetadata().findFirstValue(null, 'store:aliasName');
      if (aliasName) {
        this.apiAlias.setAttribute('value', aliasName);
        this.currentAliasName = aliasName;
        this._updateExampleURL(aliasName);
      } else {
        this._updateExampleURL();
      }
      if (this.currentAliasName) { // check for
        // domClass.remove(this.removeButton, 'disabled');
        this.removeButton.setAttribute('disabled', false);
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
    this.getAPIStatus(this.etlEntry).then((status) => {
      if (status === 'available') {
        api.updateAliasInEntry(this.etlEntry, aliasName);
      }
    });
  },
  detectAPI() {
    this.__apiRefreshButton.style.display = 'none';
    this.apiInfo.style.display = '';
    this.apiStatus.style.color = 'black';
    this.getAPIStatus(this.etlEntry)
      .then((status) => {
        const statusMessageKey = `apiStatus_${status}`;
        this.apiStatus.innerHTML = this.NLSBundles.escaFiles[statusMessageKey];
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
      });
  },
  getAPIStatus(etlEntry) {
    etlEntry.setRefreshNeeded();
    return etlEntry.refresh().then(() => {
      const oldStatus = api.oldStatus(etlEntry);
      if (oldStatus != null) {
        return oldStatus;
      }
      return api.load(etlEntry).then(data => api.update(etlEntry, data).then(() =>
        api.status(data)));
    });
  },
});
