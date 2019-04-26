import ApiInfoDialog from 'catalog/datasets/ApiInfoDialog';
import FileReplaceDialog from 'catalog/datasets/FileReplaceDialog';
import GenerateAPI from 'catalog/datasets/GenerateAPI';
import ManageFilesDialog from 'catalog/datasets/ManageFiles';
import RevisionsDialog from 'catalog/datasets/RevisionsDialog';
import StatisticsDialog from 'catalog/datasets/StatisticsDialog';
import {
  isAccessDistribution,
  isAPIDistribution,
  isFileDistributionWithOutAPI,
  isUploadedDistribution,
} from 'catalog/datasets/utils/distributionUtil';
import escaDatasetNLS from 'catalog/nls/escaDataset.nls';
import escaFilesListNLS from 'catalog/nls/escaFilesList.nls';
import EntryType from 'commons/create/EntryType';
import typeIndex from 'commons/create/typeIndex';
import ListDialogMixin from 'commons/list/common/ListDialogMixin';
import RDFormsEditDialog from 'commons/rdforms/RDFormsEditDialog';
import registry from 'commons/registry';
import Lookup from 'commons/types/Lookup';
import DOMUtil from 'commons/util/htmlUtil';
import declare from 'dojo/_base/declare';
import stamp from 'dojo/date/stamp';
import { i18n } from 'esi18n';
import m from 'mithril';

export default (distribution, dataset, wrapperFunction) => {
  // STUBBED DIALOGS
  const EditDistributionDialog = declare([RDFormsEditDialog, ListDialogMixin], {
    maxWidth: 800,
    explicitNLS: true,
    open(params) {
      const escaDataset = i18n.getLocalization(escaDatasetNLS);
      this.inherited(arguments);

      this.onDone = params.onDone;
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
        this.showChildEntry(entry, dataset, 'mandatory');
      });
    },
    doneAction(graph) {
      this.distributionEntry.setMetadata(graph);
      return this.distributionEntry.commitMetadata().then(this.onDone);
    },
  });

  const AddFileDialog = declare(RDFormsEditDialog, {
    explicitNLS: true,
    maxWidth: 800,
    postCreate() {
      const valueChange = (value) => {
        if (value != null) {
          this.unlockFooterButton();
        } else {
          this.lockFooterButton();
        }
      };
      this.fileOrLink = new EntryType({
        valueChange,
      }, DOMUtil.create('div', null, this.containerNode, true));
      this.inherited(arguments);
    },
    updateGenericCreateNLS() {
      this.doneLabel = this.list.nlsSpecificBundle.createButton;
      this.title = this.list.nlsSpecificBundle.createHeader;
      this.updateTitleAndButton();
    },
    open(params) {
      this.currentParams = params;
      this.list = params.list;
      const context = registry.get('context');
      this.distributionEntry = params.list.entry;
      this.fileOrLink.show(true, false, false);
      this.updateGenericCreateNLS();
      this._newEntry = context.newEntry();
      const nds = this._newEntry;
      nds.getMetadata().add(nds.getResourceURI(), 'rdf:type', 'esterms:File');
      this.show(nds.getResourceURI(), nds.getMetadata(), this.list.getTemplate(), 'recommended');
      this.onDone = params.onDone;
    },
    doneAction(graph) {
      this.distributionEntry = this.list.entry;
      const title = graph.findFirstValue(null, 'dcterms:title');
      if (!title) {
        // check whether graph have title or not
        graph.addL(this._newEntry.getResourceURI(), 'dcterms:title', this.fileOrLink.getValue());
      }
      this._newEntry.setMetadata(graph);
      return this._newEntry.commit().then(fileEntry => fileEntry.getResource(true)
        .putFile(this.fileOrLink.getFileInputElement())
        .then(() => fileEntry.refresh()
          .then(() => {
            const fileResourceURI = fileEntry.getResourceURI();
            const distMetadata = this.distributionEntry.getMetadata();
            const distResourceURI = this.distributionEntry.getResourceURI();
            distMetadata.add(distResourceURI, 'dcat:accessURL', fileResourceURI);
            distMetadata.add(distResourceURI, 'dcat:downloadURL', fileResourceURI);
            distMetadata.findAndRemove(distResourceURI, 'dcterms:modified');
            distMetadata.addD(distResourceURI, 'dcterms:modified', stamp.toISOString(new Date()), 'xsd:date');
            const format = fileEntry.getEntryInfo().getFormat();
            const manualFormatList = distMetadata.find(distResourceURI, 'dcterms:format');
            if (typeof format !== 'undefined' && manualFormatList.length === 0) {
              distMetadata.addL(distResourceURI, 'dcterms:format', format);
            }
            return this.distributionEntry.commitMetadata()
              .then(() => {
                this.distributionEntry.setRefreshNeeded();
                return this.distributionEntry.refresh();
              });
          })
          .then(this.onDone),
        ),
      );
    },
  });
  // END STUBBED DIALOGS

  // UTILS
  const getEtlEntry = (entry) => {
    const md = entry.getMetadata();
    const esUtil = registry.get('entrystoreutil');
    const pipelineResultResURI = md.findFirstValue(
      entry.getResourceURI(),
      registry.get('namespaces').expand('dcat:accessURL'),
    );
    return esUtil.getEntryByResourceURI(pipelineResultResURI)
      .then(pipelineResult => new Promise(r => r(pipelineResult)));
  };

  /*
   This deletes selected distribution and also deletes
   its relation to dataset
   */
  const removeDistribution = (distributionEntry, datasetEntry, onSuccess = () => {}) => {
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
            .then(fEntry => fEntry.del()),
        ));
      });
    })
      .then(onSuccess);
  };

  /*
   * This deletes the selected API distribution. It also deletes relation to dataset,
   * corresponding API, pipelineResultEntry.
   */
  const deactivateAPInRemoveDist = (distributionEntry, datasetEntry, onSuccess) => {
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
            .then(() => etlEntry.del().then(onSuccess));
        });
      });
    });
  };

  const getUploadedFileDownloadUrl = (distributionEntry) => {
    const md = distributionEntry.getMetadata();
    const subj = distributionEntry.getResourceURI();
    const accessURI = md.findFirstValue(subj, registry.get('namespaces').expand('dcat:accessURL'));
    const downloadURI = md.findFirstValue(subj, registry.get('namespaces').expand('dcat:downloadURL'));
    const es = registry.get('entrystore');
    let uri = '';
    const baseURI = es.getBaseURI();

    if (downloadURI !== '' && downloadURI != null && downloadURI.indexOf(baseURI) > -1) {
      uri = downloadURI;
    } else {
      uri = accessURI;
    }

    return uri;
  };

  /**
   *
   * @param distributionEntry
   * @return {Promise<store/Entry[]>}
   */
  const getDistributionFileEntries = (distributionEntry) => {
    const md = distributionEntry.getMetadata();
    const distRURI = distributionEntry.getResourceURI();
    const fileStmts = md.find(distRURI, 'dcat:downloadURL');
    const fileURIs = fileStmts.map(fileStmt => fileStmt.getValue());

    const esUtil = registry.getEntryStoreUtil();

    // fetch all entries asynchronously
    return Promise.all(fileURIs.map((fileURI => esUtil.getEntryByResourceURI(fileURI, registry.getContext()))));
  };

  /**
   *
   * @param {store/Entry} distributionEntry
   */
  const openNewTab = (distributionEntry) => {
    const uri = getUploadedFileDownloadUrl(distributionEntry);
    window.open(uri, '_blank');
  };
  // END UTILS

  // ACTIONS
  const editDialog = new EditDistributionDialog({}, DOMUtil.create('div'));
  const editDistribution = (onDone) => {
    // @scazan Some glue here to communicate with RDForms without a "row"
    editDialog.open({ row: { entry: distribution }, onDone });
  };

  /**
   * Open a resource in a new tab
   *
   * @returns {undefined}
   */
  const openResource = () => {
    openNewTab(distribution);
  };

  const apiInfoDialog = new ApiInfoDialog({}, DOMUtil.create('div'));
  const openApiInfo = () => {
    getEtlEntry(distribution).then((etlEntry) => {
      apiInfoDialog.open({ etlEntry, apiDistributionEntry: distribution });
    });
  };

  const activateAPI = (onSuccess, fileEntryURIs) => {
    const generateAPI = new GenerateAPI();
    generateAPI.execute({
      params: {
        distributionEntry: distribution,
        dataset,
        mode: 'new',
        fileEntryURIs,
      },
      onSuccess,
    });
  };

  const refreshAPI = (onSuccess, fileEntryURIs) => {
    const apiDistributionEntry = distribution;
    const esUtil = registry.get('entrystoreutil');
    const sourceDistributionResURI = apiDistributionEntry
      .getMetadata()
      .findFirstValue(
        apiDistributionEntry.getResourceURI(),
        'dcterms:source',
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
        onSuccess,
      });
    });
  };

  // @scazan Make some modifications to the class itself before instantiation. I pulled this logic in from the previous version so no 100% sure of the need to do it pre-instantiation
  const dv = RevisionsDialog;
  if (isUploadedDistribution(distribution, registry.get('entrystore'))) {
    dv.excludeProperties = ['dcat:accessURL', 'dcat:downloadURL'];
  } else if (isAPIDistribution(distribution)) {
    dv.excludeProperties = ['dcat:accessURL', 'dcat:downloadURL', 'dcterms:source'];
  } else {
    dv.excludeProperties = [];
  }
  dv.excludeProperties = dv.excludeProperties.map(property => registry.get('namespaces').expand(property));

  const revisionsDialog = new RevisionsDialog({}, DOMUtil.create('div'));
  const openRevisions = async () => {
    const template = await Lookup.getTemplate(distribution);
    revisionsDialog.open({
      row: { entry: distribution },
      onDone: () => m.redraw(),
      template,
    });
  };

  const remove = (onSuccess = () => {}, fileEntryURIs) => {
    const escaDataset = i18n.getLocalization(escaDatasetNLS);
    const dialogs = registry.get('dialogs');
    if (isFileDistributionWithOutAPI(distribution, fileEntryURIs, registry.get('entrystore'))) {
      dialogs.confirm(escaDataset.removeDistributionQuestion,
        null, null, (confirm) => {
          if (!confirm) {
            return;
          }
          removeDistribution(distribution, dataset, onSuccess);
        });
    } else if (isAPIDistribution(distribution)) {
      dialogs.confirm(escaDataset.removeDistributionQuestion,
        null, null, (confirm) => {
          if (!confirm) {
            return;
          }
          deactivateAPInRemoveDist(distribution, dataset, onSuccess);
        });
    } else if (isAccessDistribution(distribution, registry.get('entrystore'))) {
      dialogs.confirm(escaDataset.removeDistributionQuestion,
        null, null, (confirm) => {
          if (!confirm) {
            return;
          }
          removeDistribution(distribution, dataset, onSuccess);
        });
    } else {
      dialogs.acknowledge(escaDataset.removeFileDistWithAPI);
    }
  };

  const addFileDialog = new AddFileDialog({}, DOMUtil.create('div'));
  const openAddFile = () => {
    const escaFilesList = i18n.getLocalization(escaFilesListNLS);
    addFileDialog.open({
      list: {
        entry: distribution,
        nlsSpecificBundle: escaFilesList,
        getTemplate(entry) {
          const conf = typeIndex.getConf(entry);
          if (conf) {
            return registry.get('itemstore').getItem(conf.template);
          }

          return registry.get('itemstore').createTemplateFromChildren([
            'dcterms:title',
            'dcterms:description',
          ]);
        },
      },
      onDone: () => m.redraw(),
    });
  };

  const manageFilesDialog = new ManageFilesDialog({}, DOMUtil.create('div'));
  const openManageFiles = (fileEntryURIs) => {
    manageFilesDialog.open({
      entry: distribution,
      row: { entry: distribution },
      fileEntryApiURIs: fileEntryURIs,
      datasetEntry: dataset,
      onDone: () => m.redraw(),
    });
  };

  const showStatisticsDialog = new StatisticsDialog();
  const openStatistics = async () => {
    const fileEntries = await getDistributionFileEntries(distribution);
    showStatisticsDialog.open({
      entries: fileEntries,
      onDone: () => m.redraw(),
    });
  };

  /**
   * Open the replace file dialog
   *
   * @returns {undefined}
   */
  const dom = DOMUtil.create('div');
  const replaceFileDialog = new FileReplaceDialog({}, dom);
  const openReplaceFile = (onDone, fileEntryURIs) => {
    const md = distribution.getMetadata();
    const entryStoreUtil = registry.get('entrystoreutil');
    const downloadURI = md.findFirstValue(null, registry.get('namespaces').expand('dcat:downloadURL'));
    entryStoreUtil.getEntryByResourceURI(downloadURI).then((fileEntry) => {
      replaceFileDialog.open({
        entry: fileEntry,
        distributionEntry: distribution,
        distributionRow: { renderMetadata: onDone }, // TODO: @scazan this is handled by m.render now
        row: {
          entry: fileEntry,
          domNode: dom,
        },
        apiEntryURIs: fileEntryURIs,
        datasetEntry: dataset,
      });
    });
  };

  const actions = {
    editDistribution,
    openResource,
    openApiInfo,
    activateAPI,
    refreshAPI,
    openRevisions,
    remove,
    openAddFile,
    openManageFiles,
    openStatistics,
    openReplaceFile,
  };

  if (wrapperFunction) {
    Object.entries(actions)
      .forEach((nameAction) => actions[nameAction[0]] = wrapperFunction(nameAction[1]));
  }

  return actions;
};
