import m from 'mithril';
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
  getDistributionTemplate,
} from 'catalog/datasets/utils/distributionUtil';
import { createSetState } from 'commons/util/util';
import actions from './actions';

export default (vnode) => {
  const distributionEntry = vnode.attrs.distribution;
  const { dataset, fileEntryURIs } = vnode.attrs;

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
    const actionButtons = [];
    // actions.push(
      // <button
        // class="btn--distributionFile fa fa-fw fa-pencil"
        // title={nls.editDistributionTitle}
      // >
        // <span>{nls.editDistributionTitle}</span>
      // </button>,
    // );

    if (isUploadedDistribution(entry, registry.get('entrystore'))) { // added newly
      // Add ActivateApI menu item,if its fileEntry distribution
      if (isFileDistributionWithOutAPI(entry, fileEntryURIs, registry.get('entrystore'))) {
        actionButtons.push(
          <button
            class="btn--distribution fa fa-fw fa-link"
            title={nls.apiActivateTitle}
            onclick={actions.activateAPI}
          >
            <span>{nls.apiActivateTitle}</span>
          </button>,
        );
      }
      if (isSingleFileDistribution(entry)) {
        actionButtons.push([
          <button
            class="btn--distribution fa fa-fw fa-download"
            title={nls.downloadButtonTitle}
            onclick={actions.openResource}
          >
            <span>{nls.downloadButtonTitle}</span>
          </button>,
          <button
            class="btn--distribution fa fa-fw fa-exchange"
            title={nls.replaceFileTitle}
            onclick={replaceFile}
          >
            <span>{nls.replaceFile}</span>
          </button>,
          <button
            class="btn--distribution fa fa-fw fa-file"
            title={nls.addFileTitle}
            onclick={manageFiles}
          >
            <span>{nls.addFile}</span>
          </button>,
        ]);
      } else {
        actionButtons.push(
          <button
            class="btn--distribution fa fa-fw fa-files-o"
            title={nls.manageFilesTitle}
            onclick={manageFiles}
          >
            <span>{nls.manageFiles}</span>
          </button>,
        );
      }
    } else if (isAPIDistribution(entry)) { // Add ApiInfo menu item,if its api distribution
      actionButtons.push([
        <button
          class="btn--distribution fa fa-fw fa-info-circle"
          title={nls.apiDistributionTitle}
          onclick={actions.openApiInfo}
        >
          <span>{nls.apiDistributionTitle}</span>
        </button>,
        <button
          class="btn--distribution  fa fa-fw fa-retweet"
          title={nls.reGenerateAPITitle}
          onclick={actions.refreshAPI}
        >
          <span>{nls.reGenerateAPI}</span>
        </button>,
      ]);
    } else {
      if (!isAccessURLEmpty(entry)) {
        actionButtons.push(
          <button
            class="btn--distribution fa fa-fw fa-info-circle"
            title={nls.accessURLButtonTitle}
            onclick={actions.openResource}
          >
            <span>{nls.accessURLButtonTitle}</span>
          </button>,
        );
      }
      if (!isDownloadURLEmpty(entry)) {
        actionButtons.push(
          <button
            class="btn--distribution  fa fa-fw fa-download"
            title={nls.downloadButtonTitle}
            onclick={actions.openResource}
          >
            <span>{nls.downloadButtonTitle}</span>
          </button>,
        );
      }
    }

    // if (this.datasetRow.list.createAndRemoveDistributions) { // @scazan simple boolean defined in the class
    actionButtons.push(
      <button
        class=" btn--distribution fa fa-fw fa-remove"
        title={nls.removeDistributionTitle}
        // onclick={actions.remove}
      >
        <span>{nls.removeDistributionTitle}</span>
      </button>,
    );
    // }

    return actionButtons;
  };


  return {
    view(vnode) {
      const { distribution } =vnode.attrs;
      const escaDataset = i18n.getLocalization(escaDatasetNLS);
      const escoList = i18n.getLocalization(escoListNLS);
      return (
        <div class=" icon--wrapper distribution--file">
        { renderActions(distribution, escaDataset) }
        </div>
      );
    },
  };
};
