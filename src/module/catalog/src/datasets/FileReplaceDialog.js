import registry from 'commons/registry';
import ReplaceDialog from 'workbench/bench/ReplaceDialog';
import GenerateAPI from './GenerateAPI';
import escaFiles from 'catalog/nls/escaFiles.nls';
import escaApiProgress from 'catalog/nls/escaApiProgress.nls';
import escaManageFiles from 'catalog/nls/escaManageFiles.nls';
import eswoReplaceDialog from 'workbench/nls/eswoReplaceDialog.nls';
import declare from 'dojo/_base/declare'
import stamp from 'dojo/date/stamp'; // todo

export default declare([ReplaceDialog], {
  nlsBundles: [{eswoReplaceDialog}, {escaManageFiles}, {escaApiProgress}, {escaFiles}],
  open(params) {
    this.distributionEntry = params.distributionEntry;
    this.apiEntryURIs = params.apiEntryURIs;
    this.datasetEntry = params.datasetEntry;
    this.distributionRow = params.distributionRow;
    this.entry = params.entry;
    this.inherited(arguments);
  },
  isFileDistributionWithAPI() { // change conditions
    const es = registry.get('entrystore');
    const baseURI = es.getBaseURI();
    return (this.entry.getResourceURI().indexOf(baseURI) > -1) &&
      (this.apiEntryURIs.indexOf(this.distributionEntry.getResourceURI()) > -1);
  },
  _getApiDistributionEntry() {
    const es = registry.get('entrystore');
    const esu = registry.get('entrystoreutil');
    const list = es.newSolrQuery()
      .rdfType('dcat:Distribution')
      .uriProperty('dcterms:source', this.distributionEntry.getResourceURI())
      .limit(1)
      .list();
    return list.getEntries().then(distEntries => esu.getEntryByResourceURI(
      distEntries[0].getResourceURI()));
  },
  footerButtonAction() {
    const inp = this.fileOrLink.getFileInputElement();
    const md = this.entry.getMetadata();
    md.findAndRemove(null, 'dcterms:title');
    md.addL(this.entry.getResourceURI(), 'dcterms:title', this.fileOrLink.getValue());
    return this.entry.commitMetadata().then(() =>
      this.entry.getResource().then(resource => resource.putFile(inp).then(() => {
        this.entry.setRefreshNeeded();
        return this.entry.refresh().then(() => {
          const format = this.entry.getEntryInfo().getFormat();
          const distMd = this.distributionEntry.getMetadata();
          const distResourceURI = this.distributionEntry.getResourceURI();
          distMd.findAndRemove(distResourceURI, 'dcterms:format');
          distMd.addL(distResourceURI, 'dcterms:format', format);
          distMd.findAndRemove(distResourceURI, 'dcterms:modified');
          distMd.addD(distResourceURI, 'dcterms:modified', stamp.toISOString(new Date()), 'xsd:date');
          return this.distributionEntry.commitMetadata().then(() => {
            this.distributionRow.renderMetadata();
            if (this.isFileDistributionWithAPI()) {
              const dialogs = registry.get('dialogs');
              const confirmMessage = this.NLSBundle1.reActivateAPI;
              return dialogs.confirm(confirmMessage, null, null, (confirm) => {
                if (!confirm) {
                  this.dialog.hide();
                  return;
                }
                // this.apiProgressDialog.open({});
                this._getApiDistributionEntry().then((apiDistrEntry) => {
                  const generateAPI = new GenerateAPI();
                  generateAPI.show({
                    apiDistrEntry,
                    distributionEntry: this.distributionEntry,
                    datasetEntry: this.datasetEntry,
                    mode: 'edit',
                    escaApiProgress: this.NLSBundles.escaApiProgress,
                    escaFiles: this.NLSBundles.escaFiles,
                  });
                });
              });
            }
            return null;
          });
        });
      })));
  },
});
