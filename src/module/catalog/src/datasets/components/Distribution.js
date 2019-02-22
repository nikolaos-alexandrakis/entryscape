import m from 'mithril';
import registry from 'commons/registry';
import config from 'config';
import {i18n} from 'esi18n';
import DOMUtil from 'commons/util/htmlUtil';
import dateUtil from 'commons/util/dateUtil';
import {engine, utils as rdformsUtils} from 'rdforms';
import {template} from 'lodash-es';
import RDFormsEditDialog from 'commons/rdforms/RDFormsEditDialog';
import ListDialogMixin from 'commons/list/common/ListDialogMixin';
import RevisionsDialog from 'catalog/datasets/RevisionsDialog';
import declare from 'dojo/_base/declare';
import {
  isUploadedDistribution,
  isFileDistributionWithOutAPI,
  isSingleFileDistribution,
  isAPIDistribution,
  isAccessURLEmpty,
  isDownloadURLEmpty,
  isAccessDistribution,
} from 'catalog/datasets/utils/distributionUtil';
import {createSetState} from 'commons/util/util';
import escoList from 'commons/nls/escoList.nls';
import escaDatasetNLS from 'catalog/nls/escaDataset.nls';

import GenerateAPI from '../GenerateAPI';

export default(vnode) => {
  const { dataset } = vnode.attrs;

  const state = {
    isExpanded: false,
    isShowing: false,
    fileEntryURIs: [],
    distributionEntry: {},
  };

  const setState = createSetState(state);

  const namespaces = registry.get('namespaces');

  const getTitle = (entry, namespaces) => {
    const escaDatasetLocalized = i18n.getLocalization(escaDatasetNLS);

    const md = entry.getMetadata();
    const subj = entry.getResourceURI();
    const title = md.findFirstValue(subj, namespaces.expand('dcterms:title'));
    const downloadURI = md.findFirstValue(subj, namespaces.expand('dcat:downloadURL'));
    const source = md.findFirstValue(subj, namespaces.expand('dcterms:source'));
    if (title == null) {
      if (downloadURI != null && downloadURI !== '') {
        return escaDatasetLocalized.defaultDownloadTitle;
      } else if (source != null && source !== '') {
        return escaDatasetLocalized.autoGeneratedAPI;
      }

      return escaDatasetLocalized.defaultAccessTitle;
    }

    return title;
  };

  const getFormattedDates = (modDate) => {
    if (modDate != null) {
      const escoListLocalized = i18n.getLocalization(escoList);
      const dateFormats = dateUtil.getMultipleDateFormats(modDate);
      const tStr = template(escoListLocalized.modifiedDateTitle)({date: dateFormats.full});
      return dateFormats;
    }
    return null;
  };

  const getDistributionMetadata = (entry, namespaces) => {
    const md = entry.getMetadata();
    const subj = entry.getResourceURI();
    const accessURI = md.findFirstValue(subj, namespaces.expand('dcat:accessURL'));
    const downloadURI = md.findFirstValue(subj, namespaces.expand('dcat:downloadURL'));
    const description = md.findFirstValue(subj, namespaces.expand('dcat:description'));

    // @scazan WHAT IS TEMPLATE DRIVEN FORMAT?
    let format;
    // Check for template driven format
    const formatTemplate = config.catalog.formatTemplateId
      ? registry
        .get('itemstore')
        .getItem(config.catalog.formatTemplateId)
      : undefined;
    if (formatTemplate) {
      format = rdformsUtils.findFirstValue(engine, md, subj, formatTemplate);
    }
    // Alternatively check for pure value via array of properties
    if (!format && config.catalog.formatProp) {
      const formatPropArr = typeof config.catalog.formatProp === 'string'
        ? [config.catalog.formatProp]
        : config.catalog.formatProp;
      formatPropArr.find((prop) => {
        format = md.findFirstValue(subj, namespaces.expand(prop));
        return format != null;
      });
    }

    const modificationDate = entry
      .getEntryInfo()
      .getModificationDate();
    // this.renderDate(); this.clearDropdownMenu(); this.renderDropdownMenu();

    return {format, modificationDate, accessURI, downloadURI, description};
  };

  const expandDistribution = () => {
    setState({
      isExpanded: !state.isExpanded,
    });
  };

  const showFileDropdown = () => {
    setState({
      isShowing: !state.isShowing,
    });
  };

  const getDistributionTemplate = () => {
    // if (!this.dtemplate) { // TODO @scazan don't forget to re-institute this!!!!
    const dtemplate = registry.get('itemstore').getItem(
      config.catalog.distributionTemplateId);
    // }
    return dtemplate;
  };

const EditDistributionDialog = declare([RDFormsEditDialog, ListDialogMixin], {
  maxWidth: 800,
  explicitNLS: true,
  open(params) {
    const escaDataset = i18n.getLocalization(escaDatasetNLS);
    this.inherited(arguments);

    const entry = params.row.entry;
    this.distributionEntry = entry;
    this.set("title", escaDataset.editDistributionHeader);
    this.set("doneLabel", escaDataset.editDistributionButton);
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
        entry, getDistributionTemplate(), 'mandatory');
    });
  },
  doneAction(graph) {
    this.distributionEntry.setMetadata(graph);
    return this.distributionEntry.commitMetadata().then(() => {
      m.redraw();
    });
  },
});
  //ACTIONS
  const editDistribution = () => {
    const editDialog = new EditDistributionDialog({}, DOMUtil.create('div', null, vnode.dom));
    // TODO @scazan Some glue here to communicate with RDForms without a "row"
    editDialog.open({ row: { entry: state.distributionEntry }, onDone: () => listDistributions(dataset) });
  };

  const activateAPI = () => {
    const generateAPI = new GenerateAPI();
    generateAPI.execute({
      params: {
        distributionEntry: state.distributionEntry,
        dataset: dataset,
        mode: 'new',
        fileEntryURIs: state.fileEntryURIs,
      },
    });
  };

  const refreshAPI = () => {
    const apiDistributionEntry = state.distributionEntry;
    const esUtil = registry.get('entrystoreutil');
    const sourceDistributionResURI = apiDistributionEntry.getMetadata().findFirstValue(apiDistributionEntry.getResourceURI(), namespaces.expand('dcterms:source'));
    return esUtil.getEntryByResourceURI(sourceDistributionResURI).then((sourceDistributionEntry) => {
      const generateAPI = new GenerateAPI();
      generateAPI.execute({
        params: {
          apiDistEntry: apiDistributionEntry,
          distributionEntry: sourceDistributionEntry,
          dataset: dataset,
          mode: 'refresh',
          fileEntryURIs: state.fileEntryURIs,
        },
      });
    });
  };

const remove = () => {
  const escaDataset = i18n.getLocalization(escaDatasetNLS);
  const dialogs = registry.get('dialogs');
  // if (isFileDistributionWithOutAPI(this.entry, this.dctSource, registry.get('entrystore'))) {
  if (isFileDistributionWithOutAPI(state.distributionEntry, state.fileEntryURIs, registry.get('entrystore'))) {
    dialogs.confirm(escaDataset.removeDistributionQuestion,
      null, null, (confirm) => {
        if (!confirm) {
          return;
        }
        removeDistribution(state.distributionEntry, dataset);
      });
  } else if (isAPIDistribution(state.distributionEntry)) {
    dialogs.confirm(escaDataset.removeDistributionQuestion,
      null, null, (confirm) => {
        if (!confirm) {
          return;
        }
        deactivateAPInRemoveDist(state.distributionEntry, dataset);
      });
  } else if (isAccessDistribution(state.distributionEntry, registry.get('entrystore'))) {
    dialogs.confirm(escaDataset.removeDistributionQuestion,
      null, null, (confirm) => {
        if (!confirm) {
          return;
        }
        removeDistribution(state.distributionEntry, dataset);
      });
  } else {
    dialogs.acknowledge(escaDataset.removeFileDistWithAPI);
  }
};

  const openRevisions = () => {
    const dv = RevisionsDialog;
    if (isUploadedDistribution(state.distributionEntry, registry.get('entrystore'))) {
      dv.excludeProperties = ['dcat:accessURL', 'dcat:downloadURL'];
    } else if (isAPIDistribution(distributionEntry)) {
      dv.excludeProperties = ['dcat:accessURL', 'dcat:downloadURL', 'dcterms:source'];
    } else {
      dv.excludeProperties = [];
    }
    dv.excludeProperties = dv.excludeProperties.map(property => registry.get('namespaces').expand(property));

    const revisionsDialog = new RevisionsDialog({}, DOMUtil.create('div', null, vnode.dom));
    // @scazan Some glue here to communicate with RDForms without a "row"
    revisionsDialog.open({
      row: { entry: state.distributionEntry },
      onDone: () => m.redraw(),
      template: getDistributionTemplate(),
    });
  };

  const openResource = () => {
    openNewTab(state.distributionEntry);
  };


// END ACTIONS
// UTILS
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
        // self.datasetRow.clearDistributions();
        // self.datasetRow.listDistributions();
        return Promise.all(fileURIs.map(
          fileURI => entryStoreUtil.getEntryByResourceURI(fileURI)
            .then(fEntry => fEntry.del()))
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
              // this.datasetRow.clearDistributions();
              // this.datasetRow.listDistributions();
            }));
        });
      });
    });
  };

  const getEtlEntry = (entry) => {
    const md = entry.getMetadata();
    const esUtil = registry.get('entrystoreutil');
    const pipelineResultResURI = md.findFirstValue(entry.getResourceURI(), registry.get('namespaces').expand('dcat:accessURL'));
    return esUtil.getEntryByResourceURI(pipelineResultResURI)
      .then(pipelineResult => new Promise(r => r(pipelineResult)));
  };
// END UTILS

  const renderActions = (entry, nls) => {
    const actions = [];
    actions.push(
      <button
        class="btn--distributionFile fa fa-fw fa-pencil"
        title={nls.editDistributionTitle}
        onclick={editDistribution}
      >
        <span>{nls.editDistributionTitle}</span>
      </button>
    );

    if (isUploadedDistribution(entry, registry.get('entrystore'))) { // added newly
      // Add ActivateApI menu item,if its fileEntry distribution
      if (isFileDistributionWithOutAPI(entry, state.fileEntryURIs, registry.get('entrystore'))) {
        actions.push(
          <button 
            class="btn--distributionFile fa fa-fw fa-link"
            title={nls.apiActivateTitle}
            onclick={activateAPI}
          >
            <span>{nls.apiActivateTitle}</span>
          </button>
        );
      }
      if (isSingleFileDistribution(entry)) {
          // name: 'replaceFile',
          // method: this.replaceFile.bind(this, entry),

          // name: 'addFile',
          // method: this.addFile.bind(this, entry),
        actions.push([
          <button
            class="btn--distributionFile fa fa-fw fa-download"
            title={nls.downloadButtonTitle}
            onclick={openResource}
          >
            <span>{nls.downloadButtonTitle}</span>
          </button>,
          <button
            class="btn--distributionFile fa fa-fw fa-exchange"
            title={nls.replaceFileTitle}
            onclick={()=>console.log('replace')}
          >
            <span>{nls.replaceFile}</span>
          </button>,
          <button 
            class="btn--distributionFile fa fa-fw fa-file"
            title={nls.addFileTitle}
            onclick={()=>console.log('add file')}
          >
            <span>{nls.addFile}</span>
          </button>
        ]);
      } else {
          // name: 'manageFiles',
          // method: this.manageFiles.bind(this, entry),
        actions.push(
          <button
            class="btn--distributionFile fa fa-fw fa-files-o"
            title={nls.manageFilesTitle}
            onclick={()=>console.log('manage files')}
          >
            <span>{nls.manageFiles}</span>
          </button>
        );
      }
    } else if (isAPIDistribution(entry)) { // Add ApiInfo menu item,if its api distribution
        // name: 'apiInfo',
        // method: this.openApiInfo.bind(this, entry),

      actions.push([
        <button 
          class="btn--distributionFile fa fa-fw fa-info-circle"
          title={nls.apiDistributionTitle}
          onclick={()=>console.log('open api info')}
        >
          <span>{nls.apiDistributionTitle}</span>
        </button>,
        <button
          class="btn--distributionFile  fa fa-fw fa-retweet"
          title={nls.reGenerateAPITitle}
          onclick={refreshAPI}
        >
          <span>{nls.reGenerateAPI}</span>
        </button>
      ]);

    } else {
      if (!isAccessURLEmpty(entry)) {
        actions.push(
          <button
            class="btn--distributionFile fa fa-fw fa-info-circle"
            title={nls.accessURLButtonTitle}
            onclick={openResource}
          >
          <span>{nls.accessURLButtonTitle}</span>
          </button>
        );
      }
      if (!isDownloadURLEmpty(entry)) {
        actions.push(
          <button 
            class="btn--distributionFile  fa fa-fw fa-download"
            title={nls.downloadButtonTitle}
            onclick={openResource}
          >
            <span>{nls.downloadButtonTitle}</span>
          </button>
        );
      }
    }
    // Versions for other dist
    if (entry.getEntryInfo().hasMetadataRevisions()) {
      actions.push(
        <button
          class=" btn--distributionFile fa fa-fw fa-bookmark"
          title={nls.versionsTitle} // This comes out of escoList so a different nls bundle needs to be passed in
          onclick={openRevisions}
        >
          <span>{nls.versionsLabel}</span>
        </button>
      );
    }
    // if (this.datasetRow.list.createAndRemoveDistributions) { // @scazan simple boolean defined in the class
    if (true==true) {
      actions.push(
        <button
          class=" btn--distributionFile fa fa-fw fa-remove"
          title={nls.removeDistributionTitle}
          onclick={remove}
        >
          <span>{nls.removeDistributionTitle}</span>
        </button>
      );
    }

    return actions;
  };

  return {
    view: (vnode) => {
      const {distribution, dataset, fileEntryURIs} = vnode.attrs;
      setState({
        fileEntryURIs,
        distributionEntry: distribution,
      }, true);

      const title = getTitle(distribution, namespaces);
      const {
        format,
        modificationDate,
        accessURI,
        downloadURI,
        description,
      } = getDistributionMetadata(distribution, namespaces);

      const expandedClass = state.isExpanded ? 'expanded' : '';
      const distributionArrowClass= state.isExpanded ? 'fa-angle-up' : 'fa-angle-down';
      const showingDropdownClass = state.isShowing ? 'show': '';
      const escaDataset = i18n.getLocalization(escaDatasetNLS);

      return (
        <div>
          <div tabindex="0" class="distribution__row flex--sb" onclick={expandDistribution}>
            <div class="distribution__format">
              <p class="distribution__title">{title}</p>
              <p class="file__format">
                <span class="file__format--short">{format}</span>
              </p>
              </div>
              <div class="flex--sb">
                <p class="distribution__date">Jan 17</p>
                <span class={`icons fa ${distributionArrowClass}`}></span>
              </div>
            </div>

          <div class={`distribution__expand ${expandedClass}`}>
            <div class="flex--sb">
            <div>
              <div class="metadata--wrapper">
                <div class="distribution__description">
                  <h2 class="title">{escaDataset.distributionDescriptionTitle}</h2>
                  <p class="text">
                    If there is a description it should be here. If not then don't show anything</p>
                </div>
                <div class="distribution__format">
                  <h2 class="title">{escaDataset.distributionFormatTitle}</h2>
                  <p class="text">{ i18n.renderNLSTemplate(escaDataset.distributionFiles, {numFiles: 2}) }</p>
                </div>
              </div>
              <div class="distribution__fileRow">
                <div class="distribution__format">
                <p class="distribution__title">{title}</p>
                <p class="file__format">
                  <span class="file__format--short">{format}</span>
                </p>
                </div>
                <div class="flex--sb">
                  <p class="distributionFile__date">Jan 17</p>
                  <button class="icons fa fa-cog" onclick={showFileDropdown}></button>
                </div>
                <div class={`file__dropdownMenu ${showingDropdownClass}`}>
                  { renderActions(distribution, escaDataset) }
                </div>
              </div>

            </div>

              <div class="menu--wrapper">
                <div class=" icon--wrapper distribution--file">
                  <a>
                    <button class=" btn--distribution">
                      <span>{escaDataset.editDistributionTitle}</span>
                    </button>
                  </a>
                  <a>
                    <button class=" btn--distribution fa fa-fw fa-remove">
                      <span>{escaDataset.removeDistributionTitle}</span>
                    </button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };
};
