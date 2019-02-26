import m from 'mithril';
import config from 'config';
import { i18n } from 'esi18n';
import registry from 'commons/registry';
import RevisionsDialog from 'catalog/datasets/RevisionsDialog';
import GenerateAPI from '../GenerateAPI';
import DOMUtil from 'commons/util/htmlUtil';
import { template } from 'lodash-es';
import dateUtil from 'commons/util/dateUtil';
import escoListNLS from 'commons/nls/escoList.nls';
import escaDatasetNLS from 'catalog/nls/escaDataset.nls';
import {
  isUploadedDistribution,
  isFileDistributionWithOutAPI,
  isSingleFileDistribution,
  isAPIDistribution,
  isAccessURLEmpty,
  isDownloadURLEmpty,
  isAccessDistribution,
  getDistributionTemplate,
} from 'catalog/datasets/utils/distributionUtil';
import { createSetState } from 'commons/util/util';

export default (vnode) => {
  const distributionEntry = vnode.attrs.distribution;
  const { dataset, fileEntryURIs } = vnode.attrs;

  const state = {
    isShowing: false,
  };

  const setState = createSetState(state);


  const hideFileDropdown = () => {
    setState({
      isShowing: false,
    });
  };

  const handleOutsideClick = (e) => {
    if (!vnode.dom.contains(e.target)) {
      hideFileDropdown();
    }
  };

  const toggleFileDropdown = () => {
    if (!state.isShowing) {
      document.addEventListener('click', handleOutsideClick, false);
    } else {
      document.removeEventListener('click', handleOutsideClick, false);
    }

    setState({
      isShowing: !state.isShowing,
    });
  };

  // UTILS
  const getFormattedDates = (modDate) => {
    if (modDate != null) {
      const escoList = i18n.getLocalization(escoListNLS);
      const dateFormats = dateUtil.getMultipleDateFormats(modDate);
      const tStr = template(escoList.modifiedDateTitle)({ date: dateFormats.full });
      return dateFormats;
    }
    return null;
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
        // self.datasetRow.clearDistributions();
        // self.datasetRow.listDistributions();
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
  //
  // ACTIONS

  const activateAPI = () => {
    const generateAPI = new GenerateAPI();
    generateAPI.execute({
      params: {
        distributionEntry,
        dataset,
        mode: 'new',
        fileEntryURIs,
      },
    });
  };

  const refreshAPI = () => {
    const apiDistributionEntry = distributionEntry;
    const esUtil = registry.get('entrystoreutil');
    const sourceDistributionResURI = apiDistributionEntry.getMetadata().findFirstValue(apiDistributionEntry.getResourceURI(), namespaces.expand('dcterms:source'));
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

  const remove = () => {
    const escaDataset = i18n.getLocalization(escaDatasetNLS);
    const dialogs = registry.get('dialogs');
    // if (isFileDistributionWithOutAPI(this.entry, this.dctSource, registry.get('entrystore'))) {
    if (isFileDistributionWithOutAPI(distributionEntry, fileEntryURIs, registry.get('entrystore'))) {
      dialogs.confirm(escaDataset.removeDistributionQuestion,
        null, null, (confirm) => {
          if (!confirm) {
            return;
          }
          removeDistribution(distributionEntry, dataset);
        });
    } else if (isAPIDistribution(distributionEntry)) {
      dialogs.confirm(escaDataset.removeDistributionQuestion,
        null, null, (confirm) => {
          if (!confirm) {
            return;
          }
          deactivateAPInRemoveDist(distributionEntry, dataset);
        });
    } else if (isAccessDistribution(distributionEntry, registry.get('entrystore'))) {
      dialogs.confirm(escaDataset.removeDistributionQuestion,
        null, null, (confirm) => {
          if (!confirm) {
            return;
          }
          removeDistribution(distributionEntry, dataset);
        });
    } else {
      dialogs.acknowledge(escaDataset.removeFileDistWithAPI);
    }
  };

  const openRevisions = () => {
    const dv = RevisionsDialog;
    if (isUploadedDistribution(distributionEntry, registry.get('entrystore'))) {
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
      row: { entry: distributionEntry },
      onDone: () => m.redraw(),
      template: getDistributionTemplate(config.catalog.distributionTemplateId),
    });

    hideFileDropdown();
  };

  const openResource = () => {
    openNewTab(distributionEntry);
  };


  // END ACTIONS


  const renderActions = (entry, nls) => {
    const actions = [];
    actions.push(
      <button
        class="btn--distributionFile fa fa-fw fa-pencil"
        title={nls.editDistributionTitle}
      >
        <span>{nls.editDistributionTitle}</span>
      </button>,
    );

    if (isUploadedDistribution(entry, registry.get('entrystore'))) { // added newly
      // Add ActivateApI menu item,if its fileEntry distribution
      if (isFileDistributionWithOutAPI(entry, fileEntryURIs, registry.get('entrystore'))) {
        actions.push(
          <button
            class="btn--distributionFile fa fa-fw fa-link"
            title={nls.apiActivateTitle}
            onclick={activateAPI}
          >
            <span>{nls.apiActivateTitle}</span>
          </button>,
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
            onclick={() => console.log('replace')}
          >
            <span>{nls.replaceFile}</span>
          </button>,
          <button
            class="btn--distributionFile fa fa-fw fa-file"
            title={nls.addFileTitle}
            onclick={() => console.log('add file')}
          >
            <span>{nls.addFile}</span>
          </button>,
        ]);
      } else {
        // name: 'manageFiles',
        // method: this.manageFiles.bind(this, entry),
        actions.push(
          <button
            class="btn--distributionFile fa fa-fw fa-files-o"
            title={nls.manageFilesTitle}
            onclick={() => console.log('manage files')}
          >
            <span>{nls.manageFiles}</span>
          </button>,
        );
      }
    } else if (isAPIDistribution(entry)) { // Add ApiInfo menu item,if its api distribution
      // name: 'apiInfo',
      // method: this.openApiInfo.bind(this, entry),

      actions.push([
        <button
          class="btn--distributionFile fa fa-fw fa-info-circle"
          title={nls.apiDistributionTitle}
          onclick={() => console.log('open api info')}
        >
          <span>{nls.apiDistributionTitle}</span>
        </button>,
        <button
          class="btn--distributionFile  fa fa-fw fa-retweet"
          title={nls.reGenerateAPITitle}
          onclick={refreshAPI}
        >
          <span>{nls.reGenerateAPI}</span>
        </button>,
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
          </button>,
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
          </button>,
        );
      }
    }

    const escoList = i18n.getLocalization(escoListNLS);
    // Versions for other dist
    if (entry.getEntryInfo().hasMetadataRevisions()) {
      actions.push(
        <button
          class=" btn--distributionFile fa fa-fw fa-bookmark"
          title={escoList.versionsTitle} // This comes out of escoList so a different nls bundle needs to be passed in
          onclick={openRevisions}
        >
          <span>{escoList.versionsLabel}</span>
        </button>,
      );
    }
    // if (this.datasetRow.list.createAndRemoveDistributions) { // @scazan simple boolean defined in the class
    if (true === true) {
      actions.push(
        <button
          class=" btn--distributionFile fa fa-fw fa-remove"
          title={nls.removeDistributionTitle}
          onclick={remove}
        >
          <span>{nls.removeDistributionTitle}</span>
        </button>,
      );
    }

    return actions;
  };


  return {
    view: (vnode) => {
      const showingDropdownClass = state.isShowing ? 'show' : '';
      return (
        <div>
          <div class="flex--sb">
            <p class="distributionFile__date">Jan 17</p>
            <button class="icons fa fa-cog" onclick={toggleFileDropdown}></button>
          </div>
          <div class={`file__dropdownMenu ${showingDropdownClass}`}>
             { renderActions(vnode.attrs.distribution, vnode.attrs.nls) }
          </div>
        </div>
      );
    },
  };
};
