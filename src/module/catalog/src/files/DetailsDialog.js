import registry from 'commons/registry';
import ListDialogMixin from 'commons/list/common/ListDialogMixin';
import RDFormsEditDialog from 'commons/rdforms/RDFormsEditDialog';
import HeaderDialog from 'commons/dialog/HeaderDialog';
import htmlUtil from 'commons/util/htmlUtil';
import { utils } from 'store';
import { NLSMixin } from 'esi18n';
import escaFiles from 'catalog/nls/escaFiles.nls';
import { template } from 'lodash-es';
import declare from 'dojo/_base/declare';
import _WidgetBase from 'dijit/_WidgetBase';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import _WidgetsInTemplateMixin from 'dijit/_WidgetsInTemplateMixin';
import APIInfo from './APIInfo';
import SelectDatasetDialog from './SelectDatasetDialog';
import templateString from './DetailsDialogTemplate.html';

const ns = registry.get('namespaces');
const resultStatus = ns.expand('store:pipelineResultStatus');
const store = registry.get('entrystore');
const resultColumnName = ns.expand('store:pipelineResultColumnName');

const createFileDistribution = (fileEntry) => {
  const context = registry.get('context');
  const nds = context.newNamedEntry();
  const md = nds.getMetadata();
  md.add(nds.getResourceURI(), ns.expand('rdf:type'), ns.expand('dcat:Distribution'));
  md.add(nds.getResourceURI(), ns.expand('dcat:accessURL'), fileEntry.getResourceURI());
  md.add(nds.getResourceURI(), ns.expand('dcat:downloadURL'), fileEntry.getResourceURI());
  const format = fileEntry.getEntryInfo().getFormat();
  if (typeof format !== 'undefined') {
    md.add(nds.getResourceURI(), ns.expand('dcterms:format'), { type: 'literal', value: format });
  }
  return nds.commit();
};

/**
 *
 * @param etlEntry aka pipelineResult, points to the fileEntry (csv file) via pipelineData.
 * @param fileEntry
 * @returns {Promise}
 */
const createAPIDistribution = (etlEntry, fileEntry) => {
  const nds = fileEntry.getContext().newNamedEntry();
  const md = nds.getMetadata();
  md.add(nds.getResourceURI(), ns.expand('rdf:type'), ns.expand('dcat:Distribution'));
  md.add(nds.getResourceURI(), ns.expand('dcat:accessURL'), etlEntry.getResourceURI());
  md.add(nds.getResourceURI(), ns.expand('dcterms:source'), fileEntry.getResourceURI());
  md.add(nds.getResourceURI(), ns.expand('dcterms:format'), {
    type: 'literal',
    value: 'application/json',
  });
  return nds.commit();
};

const addDistributionsToDatasetNoCommit = (dataset, distributions) => {
  const md = dataset.getMetadata();
  (distributions || []).forEach((dist) => {
    md.add(dataset.getResourceURI(),
      ns.expand('dcat:distribution'), dist.getResourceURI());
  }, this);
};

const CreateDialog = declare(RDFormsEditDialog, {
  explicitNLS: true,
  maxWidth: 800,
  open(callback) {
    const onlyDatasetTemplate = registry.get('itemstore').getItem('dcat:OnlyDataset');
    this.fileEntry = this.details.entry;
    this.callback = callback;
    this.doneLabel = this.list.nlsSpecificBundle.createDataset;
    this.title = this.list.nlsSpecificBundle.createDatasetHeader;
    this.updateTitleAndButton();
    const context = registry.get('context');
    this._newDataset = context.newNamedEntry();
    const nds = this._newDataset;
    nds.getMetadata().add(
      nds.getResourceURI(), ns.expand('rdf:type'), ns.expand('dcat:Dataset'));
    this.show(nds.getResourceURI(), nds.getMetadata(), onlyDatasetTemplate);
  },
  doneAction(graph) {
    this._newDataset.setMetadata(graph);
    return this.createDistributions(this.fileEntry)
      .then(this.createDataset.bind(this))
      .then(this.connectToCatalog.bind(this))
      .then(this.refreshAll.bind(this));
  },
  createDistributions(fileEntry) {
    const promises = [createFileDistribution(fileEntry)];
    if (this.details.etlEntry) {
      promises.push(createAPIDistribution(this.details.etlEntry, fileEntry));
    }
    return Promise.all(promises);
  },
  createDataset(distributionEntries) {
    this.distributionEntries = distributionEntries;
    addDistributionsToDatasetNoCommit(this._newDataset, distributionEntries);
    return this._newDataset.commit();
  },
  connectToCatalog(newDatasetEntry) {
    this.datasetEntry = newDatasetEntry;
    return store.getEntry(store.getEntryURI(newDatasetEntry.getContext().getId(), 'dcat'))
      .then((catalog) => {
        this.catalogEntry = catalog;
        catalog.getMetadata().add(catalog.getResourceURI(),
          ns.expand('dcat:dataset'), newDatasetEntry.getResourceURI());
        return catalog.commitMetadata().then(() => {
          newDatasetEntry.setRefreshNeeded();
          return newDatasetEntry;
        });
      });
  },
  refreshAll() {
    const entries = [this.datasetEntry, this.fileEntry].concat(this.distributionEntries);
    return Promise.all((entries || []).map((d) => {
      d.setRefreshNeeded();
      return d.refresh();
    })).then(() => {
      this.callback();
    });
  },
});

export default declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, ListDialogMixin, NLSMixin.Dijit], {
  templateString,
  nlsBundles: [{ escaFiles }],

  postCreate() {
    this.inherited('postCreate', arguments);
    this.createNewDatasetDialog = new CreateDialog({ details: this }, htmlUtil.create('div', null, this.dialogsNode));
    this.APIInfo = new APIInfo({}, this.APIInfo);
    this.dialog = new HeaderDialog({ maxWidth: 800 }, this.dialog);
    this.datasetCreateDialog = new RDFormsEditDialog({ maxWidth: 800 }, this.createDatasetDialog);
    this.datasetSelectDialog = new SelectDatasetDialog({ maxWidth: 800 }, this.datasetSelectDialog);
  },

  open(params) {
    this.inherited(arguments);
    this.entry = params.row.entry;
    this.detectDataset();
    this.detectAPI();
    this.titleNode.innerHTML = registry.get('rdfutils').getLabel(this.entry);
    this.dialog.show();
  },

  detectDataset() {
    const contextId = this.entry.getContext().getId();
    const dists = this.entry.getReferrers(ns.expand('dcat:downloadURL'));
    if (dists.length > 0) {
      this.fileDistURI = store.getEntryURI(contextId, store.getEntryId(dists[0]));
      store.getEntry(this.fileDistURI).then((distEntry) => {
        this.fileDistEntry = distEntry;
        const datasets = distEntry.getReferrers(ns.expand('dcat:distribution'));
        if (datasets.length > 0) {
          const datasetURI = store.getEntryURI(contextId, store.getEntryId(datasets[0]));
          return store.getEntry(datasetURI);
        }
        return null;
      }).then(this.renderConnectedDataset.bind(this));
    } else {
      this.renderConnectedDataset(null);
    }
  },

  renderConnectedDataset(datasetEntry) {
    this.datasetEntry = datasetEntry;
    if (datasetEntry != null) {
      this.connectedDatasetBlock.style.display = '';
      this.noConnectedDatasetBlock.style.display = 'none';
      const rdfutils = registry.get('rdfutils');
      const label = rdfutils.getLabel(datasetEntry);
      this.connectedDatasetLabel.innerHTML = label;// datasetConnected
    } else {
      this.connectedDatasetBlock.style.display = 'none';
      this.noConnectedDatasetBlock.style.display = '';
    }
  },

  createNewDataset() {
    this.createNewDatasetDialog.open(() => {
      this.detectDataset();
      this.detectAPIDist();
    });
  },

  openConnectToSeletedDatasetDialog() {
    this.datasetSelectDialog.show(this);
  },
  connectToDataset(datasetEntry) {
    const fileEntry = this.entry;
    const etlEntry = this.etlEntry;
    this.renderConnectedDataset(datasetEntry);
    const promises = [createFileDistribution(fileEntry)];
    if (etlEntry) {
      promises.push(createAPIDistribution(etlEntry, fileEntry));
    }
    Promise.all(promises).then((dists) => {
      addDistributionsToDatasetNoCommit(datasetEntry, dists);
      datasetEntry.commitMetadata().then(() => {
        const entries = [fileEntry].concat(dists);
        if (etlEntry) {
          entries.push(etlEntry);
        }
        return Promise.all((entries || []).map((e) => {
          e.setRefreshNeeded();
          return e.refresh();
        }));
      });
    });
  },
  createDataset(distributionEntries) {
    this.distributionEntries = distributionEntries;
    addDistributionsToDatasetNoCommit(this._newDataset, distributionEntries);
    return this._newDataset.commit();
  },

  disconnectDataset() {
    const arrdefs = [];
    if (this.fileDistEntry) {
      this.datasetEntry.getMetadata().findAndRemove(this.datasetEntry.getResourceURI(),
        ns.expand('dcat:distribution'), {
          type: 'uri',
          value: this.fileDistEntry.getResourceURI(),
        });
      arrdefs.push(this.fileDistEntry.del());
    }

    if (this.etlDistEntry) {
      this.datasetEntry.getMetadata().findAndRemove(this.datasetEntry.getResourceURI(),
        ns.expand('dcat:distribution'), {
          type: 'uri',
          value: this.etlDistEntry.getResourceURI(),
        });
      arrdefs.push(this.etlDistEntry.del());
    }

    if (arrdefs.length > 0) {
      arrdefs.push(this.datasetEntry.commitMetadata());
    }
    Promise.all(arrdefs).then(() => {
      const arrDefs = [];
      if (this.etlDistEntry) {
        delete this.etlDistEntry;
        // Need to refresh more?
      }
      if (this.fileDistEntry) {
        delete this.fileDistEntry;
        this.entry.setRefreshNeeded();
        arrDefs.push(this.entry.refresh());
      }
      Promise.all(arrDefs).then(() => {
        this.maybeRemoveDataset();
      });
    });
  },

  maybeRemoveDataset() {
    const dialogs = registry.get('dialogs');
    const stmts = this.datasetEntry.getMetadata()
      .find(this.datasetEntry.getResourceURI(), ns.expand('dcat:distribution'));
    if (stmts.length === 0) {
      dialogs.confirm(
        this.NLSBundles.escaFiles.removeOrphanedDataset,
        this.NLSBundles.escaFiles.confirmRemoveOrphanedDataset,
        this.NLSBundles.escaFiles.rejectRemoveOrphanedDataset,
        this.removeConnectedDataset.bind(this));
    } else {
      this.detectDataset();
    }
  },

  removeConnectedDataset(confirmed) {
    if (confirmed) {
      const dsURI = this.datasetEntry.getResourceURI();
      const dcatURI = store.getEntryURI(this.datasetEntry.getContext().getId(), 'dcat');
      this.datasetEntry.del().then(() => {
        delete this.datasetEntry;
        return store.getEntry(dcatURI).then((catalog) => {
          catalog.getMetadata().findAndRemove(catalog.getResourceURI(),
            ns.expand('dcat:dataset'), { type: 'uri', value: dsURI });
          return catalog.commitMetadata();
        });
      }).then(() => this.detectDataset);
    } else {
      this.detectDataset();
    }
  },

  detectAPI() {
    const es = this.entry.getEntryStore();
    const etls = this.entry.getReferrers(ns.expand('store:pipelineData'));
    this.apiActivateButton.style.display = 'none';
    this.apiDeactivateButton.style.display = 'none';
    this.apiRefreshButton.style.display = 'none';
    this.apiStatus.style.color = 'black';
    this.APIInfo.style.display = 'none';
    this.APIInfo.hide();
    if (etls.length === 0) {
      this.apiActivateButton.style.display = '';
      this.apiStatus.innerHTML = this.NLSBundles.escaFiles.apiNotConnected;
    } else {
      es.getEntry(etls[0])
        .then(this.getAPIStatus.bind(this))
        .then((status) => {
          this.apiDeactivateButton.style.display = '';
          const statusMessageKey = `apiStatus_${status}`;
          this.apiStatus.innerHTML = this.NLSBundles.escaFiles[statusMessageKey];
          switch (status) {
            case 'error':
              this.apiStatus.style.color = 'red';
              break;
            case 'available':
              this.apiStatus.style.color = 'green';
              break;
            default:
              this.apiStatus.style.color = 'orange';
              this.apiRefreshButton.style.display = '';
          }
          this.APIInfo.show(this.etlEntry);
        });
      this.detectAPIDist();
    }
  },
  detectAPIDist() {
    const es = this.entry.getEntryStore();
    const dists = this.entry.getReferrers(ns.expand('dcterms:source'));
    if (dists.length !== 0) {
      const distEntryURI =
        es.getEntryURI(this.entry.getContext().getId(), es.getEntryId(dists[0]));
      es.getEntry(distEntryURI).then((e) => {
        this.etlDistEntry = e;
      });
    }
  },

  activateAPI() {
    const context = this.entry.getContext();
    const self = this;
    const f = () => {
      context.getEntryById('rowstorePipeline').then(
        pipeline => pipeline, () => {
          const pipProtEnt = context.newPipeline('rowstorePipeline');
          const pipRes = pipProtEnt.getResource();
          pipRes.addTransform(pipRes.transformTypes.ROWSTORE, {});
          return pipProtEnt.commit();
        })
        .then((pipeline) => {
          pipeline.getResource().then((pres) => {
            pres.execute(self.entry).then((result) => {
              const obj = JSON.parse(result);
              self.createDistributionForAPI(obj.result[0]).then(() => {
                self.detectAPI();
              }, () => {
                self.entry.setRefreshNeeded();
                self.entry.refresh().then(() => {
                  self.detectAPI();
                });
              });
            });
          });
        });
    };
    const format = this.entry.getEntryInfo().getFormat();
    if (format !== 'text/csv') {
      const dialogs = registry.get('dialogs');
      dialogs.confirm(template(this.NLSBundles.escaFiles.onlyCSVSupported)({ format: format || '-' }),
        this.NLSBundles.escaFiles.confirmAPIActivation, this.NLSBundles.escaFiles.abortAPIActivation).then(f);
    } else {
      f();
    }
  },

  createDistributionForAPI(pipelineResultEntryURI) {
    if (!pipelineResultEntryURI || !this.datasetEntry) {
      return new Promise((resolve, reject) => {
        reject(!pipelineResultEntryURI
          ? 'No API to create distribution for.' : 'No Dataset to create distribution in.');
      });
    }
    const fileEntry = this.entry;
    const datasetEntry = this.datasetEntry;
    return this.entry.getEntryStore().getEntry(pipelineResultEntryURI)
      .then(prEntry => createAPIDistribution(prEntry, fileEntry).then((distEntry) => {
        fileEntry.setRefreshNeeded();
        fileEntry.refresh();
        return utils.addRelation(datasetEntry, ns.expand('dcat:distribution'), distEntry);
      }));
  },

  removeDistributionForAPI() {
    delete this.etlDistEntry;
    const es = this.entry.getEntryStore();
    const contextId = this.entry.getContext().getId();
    const APIdists = this.entry.getReferrers(ns.expand('dcterms:source'));
    if (APIdists.length > 0 && this.datasetEntry) {
      const uri = es.getEntryURI(contextId, es.getEntryId(APIdists[0]));
      return es.getEntry(uri).then(dist => utils.remove(dist));
    }
    return new Promise(resolve => resolve(true));
  },

  deactivateAPI() {
    const self = this;
    const es = this.entry.getEntryStore();
    const contextId = this.entry.getContext().getId();
    const f = () => {
      if (self.etlEntry) {
        const uri = `${es.getBaseURI() + contextId}/resource/${self.etlEntry.getId()}`;
        return es.getREST().del(`${uri}?proxy=true`)
          .then(() => self.etlEntry.del().then(() => {
            delete self.etlEntry;
            self.entry.setRefreshNeeded();
            return self.entry.refresh().then(() => {
              self.detectAPI();
            });
          })); // TODO, handle if rowstore dataset already is removed
      }
      // TODO check if null is the right thing to return here
      return null;
    };
    this.removeDistributionForAPI().then(f, f);
  },

  refreshAPIStatus() {
    this.detectAPI();
  },

  getAPIStatus(etlEntry) {
    this.etlEntry = etlEntry;
    const extMD = etlEntry.getCachedExternalMetadata();
    let status = extMD.findFirstValue(null, resultStatus);
    if (status != null) {
      return status;
    }
    const es = etlEntry.getEntryStore();
    return es.loadViaProxy(etlEntry.getEntryInfo().getExternalMetadataURI()).then((data) => {
      switch (data.status) {
        case 0:
          return 'created';
        case 1:
          return 'accepted';
        case 2:
          return 'processing';
        case 3:
          status = 'available';
          break;
        case 4:
          status = 'error';
          break;
        default:
      }
      if (data.columnnames && data.columnnames.length > 0) {
        data.columnnames.forEach((col) => {
          extMD.add(etlEntry.getResourceURI(), resultColumnName, { type: 'literal', value: col });
        });
      }
      extMD.add(etlEntry.getResourceURI(), resultStatus, { type: 'literal', value: status });
      etlEntry.commitCachedExternalMetadata();
      return status;
    });
  },
});
