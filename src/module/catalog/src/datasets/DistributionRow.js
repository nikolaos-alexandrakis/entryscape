import escaApiProgress from 'catalog/nls/escaApiProgress.nls';
import escaDataset from 'catalog/nls/escaDataset.nls';
import escaFiles from 'catalog/nls/escaFiles.nls';
import DropdownMenu from 'commons/menu/DropdownMenu';
import escoList from 'commons/nls/escoList.nls';
import registry from 'commons/registry';
import dateUtil from 'commons/util/dateUtil';
import htmlUtil from 'commons/util/htmlUtil';
import config from 'config';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import _WidgetBase from 'dijit/_WidgetBase';
import declare from 'dojo/_base/declare';
import { NLSMixin } from 'esi18n';
import jquery from 'jquery';
import { template } from 'lodash-es';
import { engine, utils as rdformsUtils } from 'rdforms';
import { utils } from 'store';
import ApiInfoDialog from './ApiInfoDialog';
import templateString from './DistributionRowTemplate.html';
import GenerateAPI from './GenerateAPI';

const ns = registry.get('namespaces');

const createAPIDistribution = (etlEntry, parentDistEntry) => parentDistEntry.getContext().newNamedEntry()
  .add('rdf:type', 'dcat:Distribution')
  .add('dcat:accessURL', etlEntry.getResourceURI())
  .add('dcterms:conformsTo', `${etlEntry.getResourceURI()}/swagger`)
  .add('dcterms:source', parentDistEntry.getResourceURI())
  .addL('dcterms:format', 'application/json')
  .commit();

export default declare([_WidgetBase, _TemplatedMixin, NLSMixin.Dijit], {
  templateString,
  entry: null,
  datasetRow: null,
  nlsBundles: [{ escaDataset }, { escoList }, { escaFiles }, { escaApiProgress }],
  isDownload: true,
  postCreate() {
    this.dropdownMenu = new DropdownMenu({}, this.buttonMenuNode);
    this.apiInfoDialog = new ApiInfoDialog({},
      htmlUtil.create('div', null, this.dialogContainer));
    this.dropdownMenu.domNode.classList.add('pull-right');
    jquery(this.warningNode).popover();
    this.renderMetadata();
    this.showFormatWarning();
    this.inherited('postCreate', arguments);
  },
  renderMetadata() {
    const md = this.entry.getMetadata();
    const subj = this.entry.getResourceURI();
    const title = md.findFirstValue(subj, ns.expand('dcterms:title'));
    const access = md.findFirstValue(subj, ns.expand('dcat:accessURL'));
    const downloadURI = md.findFirstValue(subj, ns.expand('dcat:downloadURL'));
    // clear format ,title,urlNode
    const empty = '';
    this.formatNode.innerHTML = empty;
    this.titleNode.innerHTML = empty;
    this.urlNode.innerHTML = empty;

    let format;
    // Check for template driven format
    const formatTemplate = config.catalog.formatTemplateId ?
      registry.get('itemstore').getItem(config.catalog.formatTemplateId) : undefined;
    if (formatTemplate) {
      format = rdformsUtils.findFirstValue(engine, md, subj, formatTemplate);
    }
    // Alternatively check for pure value via array of properties
    if (!format && config.catalog.formatProp) {
      const formatPropArr = typeof config.catalog.formatProp === 'string' ? [config.catalog.formatProp] :
        config.catalog.formatProp;
      formatPropArr.find((prop) => {
        format = md.findFirstValue(subj, ns.expand(prop));
        return format != null;
      });
    }
    // If there is a nice format, show it
    if (format !== '' && format != null) {
      this.titleTd.classList.toggle('withFormat', format !== '' && format != null);
      this.formatNode.innerHTML = format;
    }

    if (title != null && title !== '') {
      // add title
      this.titleNode.innerHTML = title;
    } else {
      this.renderTitle();
    }
    if ((title == null) && (format == null)) {
      // add accessURL or download URL
      this.urlNode.innerHTML = access || downloadURI;
    }
    // this.titleNode, "innerHTML", title || desc || access);
    // domClass.toggle(this.titleTd, "withFormat", format !== "" && format != null);
    // domAttr.set(this.formatNode, "innerHTML", format || "");
    this.modDate = this.entry.getEntryInfo().getModificationDate();
    this.renderDate();
    this.clearDropdownMenu();
    this.renderDropdownMenu();
  },
  renderDate() {
    if (this.NLSBundles.escoList && this.modDate != null) { // Localization strings are loaded.
      const mDateFormats = dateUtil.getMultipleDateFormats(this.modDate);
      const tStr = template(this.NLSBundles.escoList.modifiedDateTitle)({ date: mDateFormats.full });
      this.modifiedNode.innerHTML = mDateFormats.short;
      this.modifiedNode.setAttribute('title', tStr);
    }
  },
  clearDropdownMenu() {
    this.dropdownMenu.removeItems();
  },
  /*
   This is to add menu items to dropdown menu depending on type of distribution.
   Every distribution will have edit, delete menu items.
   */
  renderDropdownMenu() {
    this.dropdownMenu.addItem({
      name: 'edit',
      button: 'default',
      icon: 'pencil',
      iconType: 'fa',
      nlsKey: 'editDistributionTitle',
      nlsKeyTitle: 'editDistributionTitle',
      method: this.edit.bind(this),
    });
    if (this.isUploadedDistribution()) { // added newly
      // Add ActivateApI menu item,if its fileEntry distribution
      if (this.isFileDistributionWithOutAPI()) {
        this.dropdownMenu.addItem({
          name: 'activateAPI',
          button: 'default',
          iconType: 'fa',
          icon: 'link',
          nlsKey: 'apiActivateTitle',
          nlsKeyTitle: 'apiActivateTitle',
          method: this.activateAPI.bind(this, this.entry),
        });
      }
      if (this.isSingleFileDistribution()) {
        this.dropdownMenu.addItem({
          name: 'download',
          button: 'default',
          iconType: 'fa',
          icon: 'download',
          nlsKey: 'downloadButtonTitle',
          nlsKeyTitle: 'downloadButtonTitle',
          method: this.openNewTab.bind(this, this.entry),
        });
        this.dropdownMenu.addItem({
          name: 'replaceFile',
          button: 'default',
          iconType: 'fa',
          icon: 'exchange',
          nlsKey: 'replaceFile',
          nlsKeyTitle: 'replaceFileTitle',
          method: this.replaceFile.bind(this, this.entry),
        });
        this.dropdownMenu.addItem({
          name: 'addFile',
          button: 'default',
          iconType: 'fa',
          icon: 'file',
          nlsKey: 'addFile',
          nlsKeyTitle: 'addFileTitle',
          method: this.addFile.bind(this, this.entry),
        });
      } else {
        // manage files
        this.dropdownMenu.addItem({
          name: 'manageFiles',
          button: 'default',
          iconType: 'fa',
          icon: 'files-o',
          nlsKey: 'manageFiles',
          nlsKeyTitle: 'manageFilesTitle',
          method: this.manageFiles.bind(this, this.entry),
        });
      }
    } else if (this.isAPIDistribution()) { // Add ApiInfo menu item,if its api distribution
      this.dropdownMenu.addItem({
        name: 'apiInfo',
        button: 'default',
        iconType: 'fa',
        icon: 'info-circle',
        nlsKey: 'apiDistributionTitle',
        nlsKeyTitle: 'apiDistributionTitle',
        method: this.openApiInfo.bind(this, this.entry),
      });
      this.dropdownMenu.addItem({
        name: 'reGenerateAPI',
        button: 'default',
        iconType: 'fa',
        icon: 'retweet',
        nlsKey: 'reGenerateAPI',
        nlsKeyTitle: 'reGenerateAPITitle',
        method: this.refreshAPI.bind(this, this.entry),
      });
    } else {
      if (!this.isAccessURLEmpty()) {
        this.dropdownMenu.addItem({
          name: 'access',
          button: 'default',
          iconType: 'fa',
          icon: 'info-circle',
          nlsKey: 'accessURLButtonTitle',
          nlsKeyTitle: 'accessURLButtonTitle',
          method: this.openNewTab.bind(this, this.entry),
        });
      }
      if (!this.isDownloadURLEmpty()) {
        this.dropdownMenu.addItem({
          name: 'download',
          button: 'default',
          iconType: 'fa',
          icon: 'download',
          nlsKey: 'downloadButtonTitle',
          nlsKeyTitle: 'downloadButtonTitle',
          method: this.openNewTab.bind(this, this.entry),
        });
      }
    }
    // Versions for other dist
    if (this.entry.getEntryInfo().hasMetadataRevisions()) {
      this.dropdownMenu.addItem({
        name: 'versions',
        button: 'default',
        icon: 'bookmark',
        iconType: 'fa',
        nlsKey: 'versionsLabel',
        nlsKeyTitle: 'versionsTitle',
        method: this.openVersions.bind(this, this.entry),
      });
    }
    if (this.datasetRow.list.createAndRemoveDistributions) {
      this.dropdownMenu.addItem({
        name: 'remove',
        button: 'default',
        icon: 'remove',
        iconType: 'fa',
        nlsKey: 'removeDistributionTitle',
        nlsKeyTitle: 'removeDistributionTitle',
        method: this.remove.bind(this),
      });
    }
    this.dropdownMenu.updateLocaleStrings(this.NLSLocalized.escoList, this.NLSLocalized.escaDataset);
  },
  isFileDistributionWithOutAPI() {
    // old code to check API activated or not
    const fileStmts = this.entry.getMetadata().find(this.entry.getResourceURI(),
      'dcat:downloadURL');
    const es = registry.get('entrystore');
    const baseURI = es.getBaseURI();
    const apiResourceURIs = this.dctSource;
    const old = fileStmts.every((fileStmt) => {
      const fileResourceURI = fileStmt.getValue();
      return (fileResourceURI.indexOf(baseURI) > -1) &&
        (apiResourceURIs.indexOf(fileResourceURI) !== -1);
    });
    if (!old) {
      // new code apiDistribution have dct:source to parentFileDistribution
      return (apiResourceURIs.indexOf(this.entry.getResourceURI()) === -1);
    }
    return !old;
  },
  isSingleFileDistribution() {
    const fileStmts = this.entry.getMetadata().find(this.entry.getResourceURI(), 'dcat:downloadURL');
    return fileStmts.length === 1;
  },
  isAPIDistribution() {
    const md = this.entry.getMetadata();
    const subj = this.entry.getResourceURI();
    const source = md.findFirstValue(subj, ns.expand('dcterms:source'));
    return !!((source !== '' && source != null));
  },
  isUploadedDistribution() {
    const md = this.entry.getMetadata();
    const subj = this.entry.getResourceURI();
    const downloadURI = md.findFirstValue(subj, ns.expand('dcat:downloadURL'));
    const es = registry.get('entrystore');
    const baseURI = es.getBaseURI();
    return !!((downloadURI !== '' && downloadURI != null && downloadURI.indexOf(baseURI) > -1));
  },
  isAccessDistribution() {
    const md = this.entry.getMetadata();
    const subj = this.entry.getResourceURI();
    const accessURI = md.findFirstValue(subj, ns.expand('dcat:accessURL'));
    const downloadURI = md.findFirstValue(subj, ns.expand('dcat:downloadURL'));
    const base = registry.get('entrystore').getBaseURI();
    return accessURI !== downloadURI || downloadURI.indexOf(base) !== 0;
  },
  isAccessURLEmpty() {
    const md = this.entry.getMetadata();
    const subj = this.entry.getResourceURI();
    const accessURI = md.findFirstValue(subj, ns.expand('dcat:accessURL'));
    return !((accessURI !== '' && accessURI != null));
  },
  isDownloadURLEmpty() {
    const md = this.entry.getMetadata();
    const subj = this.entry.getResourceURI();
    const downloadURI = md.findFirstValue(subj, ns.expand('dcat:downloadURL'));
    return !((downloadURI !== '' && downloadURI != null));
  },
  localeChange() {
    this.renderDate();
    this.dropdownMenu.updateLocaleStrings(this.NLSBundles.escoList, this.NLSBundles.escaDataset);
    this.renderTitle();
    this.warningNode.setAttribute('data-content', this.NLSBundles.escaDataset.sameMimeTypeDistributions);
  },
  renderTitle() {
    const md = this.entry.getMetadata();
    const subj = this.entry.getResourceURI();
    const title = md.findFirstValue(subj, ns.expand('dcterms:title'));
    const downloadURI = md.findFirstValue(subj, ns.expand('dcat:downloadURL'));
    const source = md.findFirstValue(subj, ns.expand('dcterms:source'));
    if (this.NLSBundles.escoList && title == null) {
      if (downloadURI != null && downloadURI !== '') {
        this.titleNode.innerHTML = this.NLSBundles.escaDataset.defaultDownloadTitle;
      } else if (source != null && source !== '') {
        this.titleNode.innerHTML = this.NLSBundles.escaDataset.autoGeneratedAPI;
      } else {
        this.titleNode.innerHTML = this.NLSBundles.escaDataset.defaultAccessTitle;
      }
    }
  },

  remove() {
    const dialogs = registry.get('dialogs');
    if (this.isFileDistributionWithOutAPI()) {
      dialogs.confirm(this.NLSBundles.escaDataset.removeDistributionQuestion,
        null, null, (confirm) => {
          if (!confirm) {
            return;
          }
          this.removeDistribution();
        });
    } else if (this.isAPIDistribution()) {
      dialogs.confirm(this.NLSBundles.escaDataset.removeDistributionQuestion,
        null, null, (confirm) => {
          if (!confirm) {
            return;
          }
          this.deactivateAPInRemoveDist();
        });
    } else if (this.isAccessDistribution()) {
      dialogs.confirm(this.NLSBundles.escaDataset.removeDistributionQuestion,
        null, null, (confirm) => {
          if (!confirm) {
            return;
          }
          this.removeDistribution();
        });
    } else {
      dialogs.acknowledge(this.NLSBundles.escaDataset.removeFileDistWithAPI);
    }
  },
  /*
   This deletes selected distribution and also deletes
   its relation to dataset
   */
  removeDistribution() {
    const self = this;
    const resURI = self.entry.getResourceURI();
    const entryStoreUtil = registry.get('entrystoreutil');
    const fileStmts = this.entry.getMetadata().find(this.entry.getResourceURI(), 'dcat:downloadURL');
    const fileURIs = fileStmts.map(fileStmt => fileStmt.getValue());
    this.entry.del().then(() => {
      this.datasetRow.entry.getMetadata().findAndRemove(null, ns.expand('dcat:distribution'), {
        value: resURI,
        type: 'uri',
      });
      return this.datasetRow.entry.commitMetadata().then(() => {
        self.entry.setRefreshNeeded();
        self.datasetRow.clearDistributions();
        self.datasetRow.listDistributions();
        return Promise.all(fileURIs.map(fileURI => entryStoreUtil.getEntryByResourceURI(fileURI)
          .then(fEntry => fEntry.del())));
      });
    }).then(this.destroy.bind(this, false)); // TODO handle errors
  },
  /*
   * This deletes the selected API distribution. It also deletes relation to dataset,
   * corresponding API, pipelineResultEntry.
   */
  deactivateAPInRemoveDist() {
    const resURI = this.entry.getResourceURI();
    const es = this.entry.getEntryStore();
    const contextId = this.entry.getContext().getId();
    this.entry.del().then(() => {
      this.datasetRow.entry.getMetadata().findAndRemove(null, ns.expand('dcat:distribution'), {
        value: resURI,
        type: 'uri',
      });
      this.datasetRow.entry.commitMetadata().then(() => {
        this.getEtlEntry(this.entry).then((etlEntry) => {
          const uri = `${es.getBaseURI() + contextId}/resource/${etlEntry.getId()}`;
          return es.getREST().del(`${uri}?proxy=true`)
            .then(() => etlEntry.del().then(() => {
              this.datasetRow.clearDistributions();
              this.datasetRow.listDistributions();
            }));
        });
      });
    });
  },
  edit() {
    this.datasetRow.list.openDialog('distributionEdit', { row: this });
  },
  openApiInfo(entry) {
    this.getEtlEntry(entry).then((etlEntry) => {
      this.apiInfoDialog.open({ etlEntry, apiDistributionEntry: this.entry });
    });
  },
  refreshAPI(entry) {
    const esUtil = registry.get('entrystoreutil');
    const distResURI = this.entry.getMetadata().findFirstValue(entry.getResourceURI(), ns.expand('dcterms:source'));
    return esUtil.getEntryByResourceURI(distResURI).then((distributionEntry) => {
      const generateAPI = new GenerateAPI();
      generateAPI.execute({
        params: {
          apiDistEntry: this.entry,
          distributionEntry,
          datasetEntry: this.datasetRow.entry,
          mode: 'refresh',
          distributionRow: this,
          datasetRow: this.datasetRow,
          escaApiProgress: this.NLSBundles.escaApiProgress,
          escaFiles: this.NLSBundles.escaFiles,
        },
      });
    });
  },
  getEtlEntry(entry) {
    const md = entry.getMetadata();
    const esUtil = registry.get('entrystoreutil');
    const pipelineResultResURI = md.findFirstValue(entry.getResourceURI(), ns.expand('dcat:accessURL'));
    return esUtil.getEntryByResourceURI(pipelineResultResURI)
      .then(pipelineResult => new Promise(r => r(pipelineResult)));
  },
  addFile() {
    this.datasetRow.list.openDialog('manageFiles', {
      entry: this.entry,
      distributionRow: this,
      row: this,
      fileEntryApiURIs: this.dctSource,
      datasetEntry: this.datasetRow.entry,
    });
  },
  replaceFile() {
    const md = this.entry.getMetadata();
    const entryStoreUtil = registry.get('entrystoreutil');
    const downloadURI = md.findFirstValue(null, ns.expand('dcat:downloadURL'));
    entryStoreUtil.getEntryByResourceURI(downloadURI).then((fileEntry) => {
      this.datasetRow.list.openDialog('replaceFile', {
        entry: fileEntry,
        distributionEntry: this.entry,
        distributionRow: this,
        row: {
          entry: fileEntry,
          domNode: this.domNode,
        },
        apiEntryURIs: this.dctSource,
        datasetEntry: this.datasetRow.entry,
      });
    });
  },
  manageFiles() {
    this.datasetRow.list.openDialog('manageFiles', {
      entry: this.entry,
      distributionRow: this,
      row: this,
      fileEntryApiURIs: this.dctSource,
      datasetEntry: this.datasetRow.entry,
    });
  },
  openNewTab() {
    const resURI = this.entry.getResourceURI();
    const md = this.entry.getMetadata();
    const subj = this.entry.getResourceURI();
    const accessURI = md.findFirstValue(subj, ns.expand('dcat:accessURL'));
    const downloadURI = md.findFirstValue(subj, ns.expand('dcat:downloadURL'));
    const es = registry.get('entrystore');
    let uri = '';
    const baseURI = es.getBaseURI();
    if (downloadURI !== '' && downloadURI != null && downloadURI.indexOf(baseURI) > -1) {
      uri = `${downloadURI}?${resURI}`;
    } else {
      uri = accessURI;
    }
    window.open(uri, '_blank');
  },
  updateDropdownMenu() {
    this.clearDropdownMenu();
    this.renderDropdownMenu();
  },
  activateAPI() {
    const generateAPI = new GenerateAPI();
    generateAPI.execute({
      params: {
        distributionEntry: this.entry,
        datasetEntry: this.datasetRow.entry,
        mode: 'new',
        distributionRow: this,
        datasetRow: this.datasetRow,
        escaApiProgress: this.NLSBundles.escaApiProgress,
        escaFiles: this.NLSBundles.escaFiles,
      },
    });
  },
  createDistributionForAPI(pipelineResultEntryURI) {
    if (!pipelineResultEntryURI || !this.datasetRow.entry) {
      return new Promise((resolve, reject) =>
        reject(!pipelineResultEntryURI
          ? 'No API to create distribution for.' : 'No Dataset to create distribution in.'));
    }
    const datasetEntry = this.datasetRow.entry;
    const self = this;
    return this.entry.getEntryStore().getEntry(pipelineResultEntryURI).then(prEntry =>
      createAPIDistribution(prEntry, self.entry).then(distEntry =>
        utils.addRelation(datasetEntry, ns.expand('dcat:distribution'), distEntry)));
  },
  openVersions() {
    const dv = this.datasetRow.list.dialogs.distributionVersions;
    if (this.isUploadedDistribution()) {
      dv.excludeProperties = ['dcat:accessURL', 'dcat:downloadURL'];
    } else if (this.isAPIDistribution()) {
      dv.excludeProperties = ['dcat:accessURL', 'dcat:downloadURL', 'dcterms:source'];
    } else {
      dv.excludeProperties = [];
    }
    dv.excludeProperties = dv.excludeProperties.map(e => ns.expand(e));

    this.datasetRow.list.openDialog('distributionVersions', {
      row: this,
      template: this.datasetRow.list.getDistributionTemplate(),
    });
  },
  showFormatWarning() {
    const format = this.entry.getMetadata().findFirstValue(this.entry.getResourceURI(), 'dcterms:format');
    const entries = Object.entries(this.uri2Format);
    const isFormatSame = entries.some(([key, value]) => {
      if (`${key}` !== this.entry.getResourceURI() && (format !== '' && format != null)) {
        return format === `${value}`;
      }

      return false;
    });
    if (isFormatSame) {
      this.warningNode.style.display = 'block';
    } else {
      this.warningNode.style.display = 'none';
    }
  },
});
