import registry from 'commons/registry';
import { validate } from 'rdforms';
import RDFormsEditDialog from 'commons/rdforms/RDFormsEditDialog';
import EntryType from 'commons/create/EntryType';
import htmlUtil from 'commons/util/htmlUtil';
import config from 'config';
import escoRdforms from 'commons/nls/escoRdforms.nls';
import escaDataset from 'catalog/nls/escaDataset.nls';
import escoEntryType from 'commons/nls/escoEntryType.nls';
import declare from 'dojo/_base/declare';
import { createEntry } from 'commons/util/storeUtil';

const ns = registry.get('namespaces');
const DistributionEntryType = declare([EntryType], {
  nlsBundles: [{ escoEntryType }, { escaDataset }],
  localeChange() {
    this.inherited(arguments);
    this.__fileOptionLabelNLS.innerHTML = this.NLSBundles.escaDataset.fileUploadDistribution;
    this.__linkOptionLabelNLS.innerHTML = this.NLSBundles.escaDataset.accessURIDistribution;
    this.__linkLabel.innerHTML = this.NLSBundles.escaDataset.accessURIDistribution;
  },
  fileOption(ev) {
    if (config.catalog && config.catalog.disallowFileuploadDistributionDialog) {
      registry.get('dialogs').restriction(config.catalog.disallowFileuploadDistributionDialog);
      ev.preventDefault();
      ev.stopPropagation();
    }
    this.inherited(arguments);
  },
});

export default declare([RDFormsEditDialog], {
  nlsBundles: [{ escoRdforms }, { escaDataset }],
  title: 'temp',
  nlsHeaderTitle: 'createDistributionHeader',
  nlsFooterButtonLabel: 'createDistributionButton',
  explicitNLS: true,
  postCreate() {
    if (!config.catalog || config.catalog.distributionTemplateCreate !== true) {
      const optionChange = () => {
        if (this.fileOrLink.isFile()) {
          this.editor.filterPredicates = {
            'http://www.w3.org/ns/dcat#accessURL': true,
            'http://www.w3.org/ns/dcat#downloadURL': true,
          };
        } else {
          this.editor.filterPredicates = { 'http://www.w3.org/ns/dcat#accessURL': true };
        }
        this.editor.render();
      };

      const valueChange = (value) => {
        if (value != null) {
          this.unlockFooterButton();
        } else {
          this.lockFooterButton();
        }
      };

      this.fileOrLink = new DistributionEntryType({
        optionChange,
        valueChange,
        list: this.list,
      }, htmlUtil.create('div', null, this.containerNode, true));
    }
    this.inherited(arguments);
    this.editor.render();
  },
  updateGenericCreateNLS() {
    this.title = this.NLSBundles.escaDataset[this.nlsHeaderTitle];
    this.doneLabel = this.NLSBundles.escaDataset[this.nlsFooterButtonLabel];
    this.updateTitleAndButton();
  },
  open(params) {
    this.row = params.row;
    if (params.onDone != null) {
      this.onDone = params.onDone;
    }
    this.datasetEntry = this.row.entry;
    if (this.fileOrLink) {
      this.fileOrLink.show(config.catalog.excludeFileuploadDistribution !== true, true, false);
      this.editor.filterPredicates = { 'http://www.w3.org/ns/dcat#accessURL': true };
    }
    this._newEntry = createEntry(null, 'dcat:Distribution');
    const nds = this._newEntry;
    nds.getMetadata().add(nds.getResourceURI(), ns.expand('rdf:type'), ns.expand('dcat:Distribution'));
    this.updateGenericCreateNLS();
    this.showChildEntry(nds, this.datasetEntry);
  },
  getReport() {
    const report = validate.bindingReport(this.editor.binding);
    if (this.fileOrLink && report.errors.length > 0) {
      report.errors = report.errors
        .filter(err => !(err.item && err.item.getProperty() === ns.expand('dcat:accessURL')));
    }
    return report;
  },

  doneAction(graph) {
    const context = registry.get('context');
    const pDistributionEntry = this._newEntry;
    this._setACL(pDistributionEntry);
    const createAndConnect = () => pDistributionEntry.setMetadata(graph).commit()
      .then((distributionEntry) => {
        this.datasetEntry.getMetadata()
          .add(this.datasetEntry.getResourceURI(), 'dcat:distribution', distributionEntry.getResourceURI());
        return this.datasetEntry.commitMetadata().then(() => {
          if (this.onDone != null) {
            this.onDone();
          }
          distributionEntry.setRefreshNeeded();
          return distributionEntry.refresh();
        });
      }, () => {
        throw this.NLSBundles.escaDataset.createDistributionErrorMessage;
      });
    const distResourceURI = pDistributionEntry.getResourceURI();
    if (this.fileOrLink) {
      if (this.fileOrLink.isFile()) {
        const pFileEntry = context.newEntry();
        const md = pFileEntry.getMetadata();
        const pfileURI = pFileEntry.getResourceURI();
        md.add(pfileURI, 'rdf:type', 'esterms:File');
        md.addL(pfileURI, 'dcterms:title', this.fileOrLink.getValue());
        return pFileEntry.commit().then(fileEntry => fileEntry.getResource(true)
          .putFile(this.fileOrLink.getFileInputElement())
          .then(() => fileEntry.refresh().then(() => {
            const fileResourceURI = fileEntry.getResourceURI();
            graph.add(distResourceURI, 'dcat:accessURL', fileResourceURI);
            graph.add(distResourceURI, 'dcat:downloadURL', fileResourceURI);
            const format = fileEntry.getEntryInfo().getFormat();
            const manualFormatList = graph.find(distResourceURI, 'dcterms:format');
            if (typeof format !== 'undefined' && manualFormatList.length === 0) {
              graph.addL(distResourceURI, 'dcterms:format', format);
            }
            return createAndConnect();
          })));
      }
      const uri = this.fileOrLink.getValue();
      graph.add(distResourceURI, 'dcat:accessURL', uri);
    }
    return createAndConnect();
  },
  _setACL(distributionEntry) {
    const datasetACL = this.datasetEntry.getEntryInfo().getACL();
    distributionEntry.getEntryInfo().setACL(datasetACL);
  },
});
