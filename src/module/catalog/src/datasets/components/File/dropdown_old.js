import config from 'config';
import { i18n } from 'esi18n';
import registry from 'commons/registry';
import ManageFilesDialog from 'catalog/datasets/ManageFiles';
import FileReplaceDialog from 'catalog/datasets/FileReplaceDialog';
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

  // END UTILS

  // ACTIONS
  const manageFiles = () => {
    const manageFilesDialog = new ManageFilesDialog({}, DOMUtil.create('div', null, vnode.dom));
    // @scazan Some glue here to communicate with RDForms without a "row"
    manageFilesDialog.open({
      entry: distributionEntry,
      row: { entry: distributionEntry },
      fileEntryURIs,
      datasetEntry: dataset,
      onDone: () => m.redraw(),
    });
  };



  const replaceFile = () => {
    const md = distributionEntry.getMetadata();
    const entryStoreUtil = registry.get('entrystoreutil');
    const downloadURI = md.findFirstValue(null, registry.get('namespaces').expand('dcat:downloadURL'));
    entryStoreUtil.getEntryByResourceURI(downloadURI).then((fileEntry) => {
      const replaceFileDialog = new FileReplaceDialog({}, DOMUtil.create('div', null, vnode.dom));
      replaceFileDialog.open({
        entry: fileEntry,
        distributionEntry,
        distributionRow: { renderMetadata: () => {} }, // TODO: @scazan this is handled by m.render now
        row: {
          entry: fileEntry,
          domNode: vnode.dom,
        },
        // apiEntryURIs: this.dctSource,
        apiEntryURIs: fileEntryURIs,
        datasetEntry: dataset,
      });
    });
  };

  // END ACTIONS
  const renderActions = (entry, nls) => {
    const actions = [];
    // actions.push(
      // <button
        // class="btn--distributionFile fas fa-fw fa-pencil"
        // title={nls.editDistributionTitle}
      // >
        // <span>{nls.editDistributionTitle}</span>
      // </button>,
    // );

    if (isUploadedDistribution(entry, registry.get('entrystore'))) { // added newly
      // Add ActivateApI menu item,if its fileEntry distribution
      if (isFileDistributionWithOutAPI(entry, fileEntryURIs, registry.get('entrystore'))) {
        actions.push(
          <button
            class="btn--distributionFile fas fa-fw fa-link"
            title={nls.apiActivateTitle}
            onclick={activateAPI}
          >
            <span>{nls.apiActivateTitle}</span>
          </button>,
        );
      }
      if (isSingleFileDistribution(entry)) {
        actions.push([
          <button
            class="btn--distributionFile fas fa-fw fa-download"
            title={nls.downloadButtonTitle}
            onclick={openResource}
          >
            <span>{nls.downloadButtonTitle}</span>
          </button>,
          <button
            class="btn--distributionFile fas fa-fw fa-exchange"
            title={nls.replaceFileTitle}
            onclick={replaceFile}
          >
            <span>{nls.replaceFile}</span>
          </button>,
          <button
            class="btn--distributionFile fas fa-fw fa-file"
            title={nls.addFileTitle}
            onclick={manageFiles}
          >
            <span>{nls.addFile}</span>
          </button>,
        ]);
      } else {
        actions.push(
          <button
            class="btn--distributionFile fas fa-fw fa-copy"
            title={nls.manageFilesTitle}
            onclick={manageFiles}
          >
            <span>{nls.manageFiles}</span>
          </button>,
        );
      }
    } else if (isAPIDistribution(entry)) { // Add ApiInfo menu item,if its api distribution
      actions.push([
        <button
          class="btn--distributionFile fas fa-fw fa-info-circle"
          title={nls.apiDistributionTitle}
          onclick={openApiInfo}
        >
          <span>{nls.apiDistributionTitle}</span>
        </button>,
        <button
          class="btn--distributionFile  fas fa-fw fa-retweet"
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
            class="btn--distributionFile fas fa-fw fa-info-circle"
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
            class="btn--distributionFile  fas fa-fw fa-download"
            title={nls.downloadButtonTitle}
            onclick={openResource}
          >
            <span>{nls.downloadButtonTitle}</span>
          </button>,
        );
      }
    }

    // if (this.datasetRow.list.createAndRemoveDistributions) { // @scazan simple boolean defined in the class
    actions.push(
      <button
      class=" btn--distributionFile fas fa-fw fa-times"
      title={nls.removeDistributionTitle}
      // onclick={remove}
      >
        <span>{nls.removeDistributionTitle}</span>
      </button>,
    );
    // }

    return actions;
  };


  return {
    view(vnode) {
      const showingDropdownClass = state.isShowing ? 'ESshow' : '';
      return (
        <div>
          <div class="flex--sb">
            <p class="distributionFile__date">Jan 17</p>
            <button class="icons fas fa-cog" onclick={toggleFileDropdown}></button>
          </div>
          <div class={`file__dropdownMenu ${showingDropdownClass}`}>
          </div>
        </div>
      );
    },
  };
};
