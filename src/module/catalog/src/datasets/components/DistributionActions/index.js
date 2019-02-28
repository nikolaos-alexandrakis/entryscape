import m from 'mithril';
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
  getDistributionTemplate,
} from 'catalog/datasets/utils/distributionUtil';
import bindActions from './actions';

export default (vnode) => {
  const { distribution, dataset, fileEntryURIs } = vnode.attrs;
  const actions = bindActions(distribution, dataset, fileEntryURIs, vnode.dom);

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


  // END UTILS

  // ACTIONS
  const manageFiles = () => {
    const manageFilesDialog = new ManageFilesDialog({}, DOMUtil.create('div', null, vnode.dom));
    // @scazan Some glue here to communicate with RDForms without a "row"
    manageFilesDialog.open({
      entry: distribution,
      row: { entry: distribution },
      fileEntryURIs,
      datasetEntry: dataset,
      onDone: () => m.redraw(),
    });
  };

  const replaceFile = () => {
    const md = distribution.getMetadata();
    const entryStoreUtil = registry.get('entrystoreutil');
    const downloadURI = md.findFirstValue(null, registry.get('namespaces').expand('dcat:downloadURL'));
    entryStoreUtil.getEntryByResourceURI(downloadURI).then((fileEntry) => {
      const replaceFileDialog = new FileReplaceDialog({}, DOMUtil.create('div', null, vnode.dom));
      replaceFileDialog.open({
        entry: fileEntry,
        distributionEntry: distribution,
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
  const renderActions = (entry) => {
    const escaDataset = i18n.getLocalization(escaDatasetNLS);
    const escoList = i18n.getLocalization(escoListNLS);
    const actionButtons = [];
    // actions.push(
      // <button
        // class="btn--distributionFile fa fa-fw fa-pencil"
        // title={nls.editDistributionTitle}
      // >
        // <span>{nls.editDistributionTitle}</span>
      // </button>,
    // );

    actionButtons.push(
      <button class=" btn--distribution"
        onclick={actions.editDistribution}
      >
        <span>{escaDataset.editDistributionTitle}</span>
      </button>
    );

    if (distribution.getEntryInfo().hasMetadataRevisions()) {
      actionButtons.push(
        <button
          class=" btn--distribution fa fa-fw fa-bookmark"
          title={escoList.versionsTitle}
          onclick={actions.openRevisions}
        >
          <span>{escoList.versionsLabel}</span>
        </button>
      );
    }

    if (isUploadedDistribution(entry, registry.get('entrystore'))) { // added newly
      // Add ActivateApI menu item,if its fileEntry distribution
      if (isFileDistributionWithOutAPI(entry, fileEntryURIs, registry.get('entrystore'))) {
        actionButtons.push(
          <button
            class="btn--distribution fa fa-fw fa-link"
            title={escaDataset.apiActivateTitle}
            onclick={actions.activateAPI}
          >
            <span>{escaDataset.apiActivateTitle}</span>
          </button>,
        );
      }
      if (isSingleFileDistribution(entry)) {
        actionButtons.push([
          <button
            class="btn--distribution fa fa-fw fa-download"
            title={escaDataset.downloadButtonTitle}
            onclick={actions.openResource}
          >
            <span>{escaDataset.downloadButtonTitle}</span>
          </button>,
          <button
            class="btn--distribution fa fa-fw fa-exchange"
            title={escaDataset.replaceFileTitle}
            onclick={replaceFile}
          >
            <span>{escaDataset.replaceFile}</span>
          </button>,
          <button
            class="btn--distribution fa fa-fw fa-file"
            title={escaDataset.addFileTitle}
            onclick={manageFiles}
          >
            <span>{escaDataset.addFile}</span>
          </button>,
        ]);
      } else {
        actionButtons.push(
          <button
            class="btn--distribution fa fa-fw fa-files-o"
            title={escaDataset.manageFilesTitle}
            onclick={manageFiles}
          >
            <span>{escaDataset.manageFiles}</span>
          </button>,
        );
      }
    } else if (isAPIDistribution(entry)) { // Add ApiInfo menu item,if its api distribution
      actionButtons.push([
        <button
          class="btn--distribution fa fa-fw fa-info-circle"
          title={escaDataset.apiDistributionTitle}
          onclick={actions.openApiInfo}
        >
          <span>{escaDataset.apiDistributionTitle}</span>
        </button>,
        <button
          class="btn--distribution  fa fa-fw fa-retweet"
          title={escaDataset.reGenerateAPITitle}
          onclick={actions.refreshAPI}
        >
          <span>{escaDataset.reGenerateAPI}</span>
        </button>,
      ]);
    } else {
      if (!isAccessURLEmpty(entry)) {
        actionButtons.push(
          <button
            class="btn--distribution fa fa-fw fa-info-circle"
            title={escaDataset.accessURLButtonTitle}
            onclick={actions.openResource}
          >
            <span>{escaDataset.accessURLButtonTitle}</span>
          </button>,
        );
      }
      if (!isDownloadURLEmpty(entry)) {
        actionButtons.push(
          <button
            class="btn--distribution  fa fa-fw fa-download"
            title={escaDataset.downloadButtonTitle}
            onclick={actions.openResource}
          >
            <span>{escaDataset.downloadButtonTitle}</span>
          </button>,
        );
      }
    }

    // if (this.datasetRow.list.createAndRemoveDistributions) { // @scazan simple boolean defined in the class
    actionButtons.push(
      <button
        class=" btn--distribution fa fa-fw fa-remove"
        title={escaDataset.removeDistributionTitle}
        onclick={actions.remove}
      >
        <span>{escaDataset.removeDistributionTitle}</span>
      </button>,
    );
    // }

    return actionButtons;
  };


  return {
    view(vnode) {
      const { distribution } = vnode.attrs;
      return (
        <div class=" icon--wrapper distribution--file">
          { renderActions(distribution) }
        </div>
      );
    },
  };
};
