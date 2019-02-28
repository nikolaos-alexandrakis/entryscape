import m from 'mithril';
import config from 'config';
import registry from 'commons/registry';
import { i18n } from 'esi18n';
import declare from 'dojo/_base/declare';
import DOMUtil from 'commons/util/htmlUtil';
import RDFormsEditDialog from 'commons/rdforms/RDFormsEditDialog';
import ListDialogMixin from 'commons/list/common/ListDialogMixin';
import RevisionsDialog from 'catalog/datasets/RevisionsDialog';
import ApiInfoDialog from 'catalog/datasets/ApiInfoDialog';
import GenerateAPI from 'catalog/datasets/GenerateAPI';
import {
  isUploadedDistribution,
  isFileDistributionWithOutAPI,
  // isSingleFileDistribution,
  isAPIDistribution,
  // isAccessURLEmpty,
  // isDownloadURLEmpty,
  isAccessDistribution,
  getDistributionTemplate,
} from 'catalog/datasets/utils/distributionUtil';
import escaDatasetNLS from 'catalog/nls/escaDataset.nls';

export default (distribution, dataset, fileEntryURIs, dom) => {
  // const namespaces = registry.get('namespaces');

  // DIALOGS
  const EditDistributionDialog = declare([RDFormsEditDialog, ListDialogMixin], {
    maxWidth: 800,
    explicitNLS: true,
    open(params) {
      const escaDataset = i18n.getLocalization(escaDatasetNLS);
      this.inherited(arguments);

      const entry = params.row.entry;
      this.distributionEntry = entry;
      this.set('title', escaDataset.editDistributionHeader);
      this.set('doneLabel', escaDataset.editDistributionButton);
      this.doneLabel = escaDataset.editDistributionButton;
      this.title = escaDataset.editDistributionHeader;
      this.updateTitleAndButton();
      registry.set('context', entry.getContext());
      if (isUploadedDistribution(entry, registry.get('entrystore')) ||
        isAPIDistribution(entry)) {
        this.editor.filterPredicates = {
          'http://www.w3.org/ns/dcat#accessURL': true,
          'http://www.w3.org/ns/dcat#downloadURL': true,
        };
      } else {
        this.editor.filterPredicates = {};
      }
      entry.setRefreshNeeded();
      entry.refresh().then(() => {
        this.showEntry(
          entry, getDistributionTemplate(config.catalog.distributionTemplateId), 'mandatory');
      });
    },
    doneAction(graph) {
      this.distributionEntry.setMetadata(graph);
      return this.distributionEntry.commitMetadata().then(() => {
        m.redraw();
      });
    },
  });
  // END DIALOGS
  //
  // UTILS
  const getEtlEntry = (entry) => {
    const md = entry.getMetadata();
    const esUtil = registry.get('entrystoreutil');
    const pipelineResultResURI = md.findFirstValue(
      entry.getResourceURI(),
      registry.get('namespaces').expand('dcat:accessURL')
    );
    return esUtil.getEntryByResourceURI(pipelineResultResURI)
      .then(pipelineResult => new Promise(r => r(pipelineResult)));
  };

  const openNewTab = (distributionEntry) => {
    const resURI = distributionEntry.getResourceURI();
    const md = distributionEntry.getMetadata();
    const subj = distributionEntry.getResourceURI();
    const accessURI = md.findFirstValue(subj, registry.get('namespaces').expand('dcat:accessURL'));
    const downloadURI = md.findFirstValue(subj, registry.get('namespaces').expand('dcat:downloadURL'));
    const es = registry.get('entrystore');
    let uri = '';
    const baseURI = es.getBaseURI();

    if (downloadURI !== '' && downloadURI != null && downloadURI.indexOf(baseURI) > -1) {
      uri = `${downloadURI}?${resURI}`;
    } else {
      uri = accessURI;
    }

    window.open(uri, '_blank');
  };

  /*
   This deletes selected distribution and also deletes
   its relation to dataset
   */
  const removeDistribution = (distributionEntry, datasetEntry) => {
    const resURI = distributionEntry.getResourceURI();
    const entryStoreUtil = registry.get('entrystoreutil');
    const fileStmts = distributionEntry.getMetadata().find(distributionEntry.getResourceURI(), 'dcat:downloadURL');
    const fileURIs = fileStmts.map(fileStmt => fileStmt.getValue());
    distributionEntry.del().then(() => {
      datasetEntry.getMetadata().findAndRemove(null, registry.get('namespaces').expand('dcat:distribution'), {
        value: resURI,
        type: 'uri',
      });
      return datasetEntry.commitMetadata().then(() => {
        distributionEntry.setRefreshNeeded();
        return Promise.all(fileURIs.map(
          fileURI => entryStoreUtil.getEntryByResourceURI(fileURI)
            .then(fEntry => fEntry.del())),
        );
      });
    })
      .then(() => m.redraw());
  };

  /*
   * This deletes the selected API distribution. It also deletes relation to dataset,
   * corresponding API, pipelineResultEntry.
   */
  const deactivateAPInRemoveDist = (distributionEntry, datasetEntry) => {
    const resURI = distributionEntry.getResourceURI();
    const es = distributionEntry.getEntryStore();
    const contextId = distributionEntry.getContext().getId();
    distributionEntry.del().then(() => {
      datasetEntry.getMetadata().findAndRemove(null, registry.get('namespaces').expand('dcat:distribution'), {
        value: resURI,
        type: 'uri',
      });
      datasetEntry.commitMetadata().then(() => {
        getEtlEntry(distributionEntry).then((etlEntry) => {
          const uri = `${es.getBaseURI() + contextId}/resource/${etlEntry.getId()}`;
          return es.getREST().del(`${uri}?proxy=true`)
            .then(() => etlEntry.del().then(() => {
              m.redraw();
            }));
        });
      });
    });
  };
  // END UTILS

  // ACTIONS
  const editDistribution = () => {
    const editDialog = new EditDistributionDialog({}, DOMUtil.create('div', null, dom));
    // TODO @scazan Some glue here to communicate with RDForms without a "row"
    editDialog.open({ row: { entry: distribution }, onDone: () => listDistributions(dataset) });
  };

  const openResource = () => {
    openNewTab(distribution);
  };

  const openApiInfo = () => {
    const apiInfoDialog = new ApiInfoDialog({}, DOMUtil.create('div', null, dom));
    getEtlEntry(distribution).then((etlEntry) => {
      apiInfoDialog.open({ etlEntry, apiDistributionEntry: distribution });
    });
  };

  const activateAPI = () => {
    const generateAPI = new GenerateAPI();
    generateAPI.execute({
      params: {
        distribution,
        dataset,
        mode: 'new',
        fileEntryURIs,
      },
    });
  };

  const refreshAPI = () => {
    const apiDistributionEntry = distribution;
    const esUtil = registry.get('entrystoreutil');
    const sourceDistributionResURI = apiDistributionEntry
      .getMetadata()
      .findFirstValue(
        apiDistributionEntry.getResourceURI(),
        registry.get('namespaces').expand('dcterms:source'),
      );
    return esUtil.getEntryByResourceURI(sourceDistributionResURI).then((sourceDistributionEntry) => {
      const generateAPI = new GenerateAPI();
      generateAPI.execute({
        params: {
          apiDistEntry: apiDistributionEntry,
          distributionEntry: sourceDistributionEntry,
          dataset,
          mode: 'refresh',
          fileEntryURIs,
        },
      });
    });
  };

  const openRevisions = () => {
    const dv = RevisionsDialog;
    if (isUploadedDistribution(distribution, registry.get('entrystore'))) {
      dv.excludeProperties = ['dcat:accessURL', 'dcat:downloadURL'];
    } else if (isAPIDistribution(distribution)) {
      dv.excludeProperties = ['dcat:accessURL', 'dcat:downloadURL', 'dcterms:source'];
    } else {
      dv.excludeProperties = [];
    }
    dv.excludeProperties = dv.excludeProperties.map(property => registry.get('namespaces').expand(property));

    const revisionsDialog = new RevisionsDialog({}, DOMUtil.create('div', null, dom));
    // @scazan Some glue here to communicate with RDForms without a "row"
    revisionsDialog.open({
      row: { entry: distribution },
      onDone: () => m.redraw(),
      template: getDistributionTemplate(config.catalog.distributionTemplateId),
    });
  };

  const remove = () => {
    const escaDataset = i18n.getLocalization(escaDatasetNLS);
    const dialogs = registry.get('dialogs');
    // if (isFileDistributionWithOutAPI(this.entry, this.dctSource, registry.get('entrystore'))) {
    if (isFileDistributionWithOutAPI(distribution, fileEntryURIs, registry.get('entrystore'))) {
      dialogs.confirm(escaDataset.removeDistributionQuestion,
        null, null, (confirm) => {
          if (!confirm) {
            return;
          }
          removeDistribution(distribution, dataset);
        });
    } else if (isAPIDistribution(distribution)) {
      dialogs.confirm(escaDataset.removeDistributionQuestion,
        null, null, (confirm) => {
          if (!confirm) {
            return;
          }
          deactivateAPInRemoveDist(distribution, dataset);
        });
    } else if (isAccessDistribution(distribution, registry.get('entrystore'))) {
      dialogs.confirm(escaDataset.removeDistributionQuestion,
        null, null, (confirm) => {
          if (!confirm) {
            return;
          }
          removeDistribution(distribution, dataset);
        });
    } else {
      dialogs.acknowledge(escaDataset.removeFileDistWithAPI);
    }
  };
  // END ACTIONS

  return {
    editDistribution,
    openResource,
    openApiInfo,
    activateAPI,
    refreshAPI,
    openRevisions,
    remove,
  };
};
