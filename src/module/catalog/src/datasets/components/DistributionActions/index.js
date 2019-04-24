import { i18n } from 'esi18n';
import registry from 'commons/registry';
import DOMUtil from 'commons/util/htmlUtil';
import Dropdown from 'commons/components/common/Dropdown';
import {
  isUploadedDistribution,
  isFileDistributionWithOutAPI,
  isSingleFileDistribution,
  isAPIDistribution,
  isAccessURLEmpty,
  isDownloadURLEmpty,
} from 'catalog/datasets/utils/distributionUtil';
import escoListNLS from 'commons/nls/escoList.nls';
import escaDatasetNLS from 'catalog/nls/escaDataset.nls';
import bindActions from './actions';

/**
 * Renders a list of action buttons that can be applied to a distribution
 *
 * @returns {undefined}
 */
export default (vnode) => {
  const { distribution, dataset, refreshDistributions = () => {} } = vnode.attrs;
  const actions = bindActions(distribution, dataset, DOMUtil.preventBubbleWrapper);

  const renderActions = (entry, fileEntryURIs) => {
    const escaDataset = i18n.getLocalization(escaDatasetNLS);
    const escoList = i18n.getLocalization(escoListNLS);
    const actionButtons = [];

    const refreshAPI = e => actions.refreshAPI(e, [refreshDistributions, fileEntryURIs]);
    const activateAPI = e => actions.activateAPI(e, [refreshDistributions, fileEntryURIs]);
    const removeDistribution = e => actions.remove(e, [refreshDistributions, fileEntryURIs]);
    const editDistribution = e => actions.editDistribution(e, [() => m.redraw(), fileEntryURIs]);
    const openReplaceFile = e => actions.openReplaceFile(e, [() => m.redraw(), fileEntryURIs]);
    const openManageFiles = e => actions.openManageFiles(e, [fileEntryURIs]);
    const openStatistics = e => actions.openStatistics(e, [fileEntryURIs]);

    actionButtons.push(
      <button
        class=" btn--distribution fa fa-fw fa-pencil"
        onmousedown={editDistribution}
      >
        <span>{escaDataset.editDistributionTitle}</span>
      </button>,
    );

    if (distribution.getEntryInfo().hasMetadataRevisions()) {
      actionButtons.push(
        <button
          class=" btn--distribution fa fa-fw fa-bookmark"
          title={escoList.versionsTitle}
          onmousedown={actions.openRevisions}
        >
          <span>{escoList.versionsLabel}</span>
        </button>,
      );
    }

    if (isUploadedDistribution(entry, registry.get('entrystore'))) { // added newly
      // Add ActivateApI menu item, if its fileEntry distribution
      if (isFileDistributionWithOutAPI(entry, fileEntryURIs, registry.get('entrystore'))) {
        actionButtons.push(
          <button
            class="btn--distribution fa fa-fw fa-link"
            title={escaDataset.apiActivateTitle}
            onmousedown={activateAPI}
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
            onmousedown={actions.openResource}
          >
            <span>{escaDataset.downloadButtonTitle}</span>
          </button>,
          <button
            class="btn--distribution fa fa-fw fa-exchange"
            title={escaDataset.replaceFileTitle}
            onmousedown={openReplaceFile}
          >
            <span>{escaDataset.replaceFile}</span>
          </button>,
          <button
            class="btn--distribution fa fa-fw fa-file"
            title={escaDataset.addFileTitle}
            onmousedown={openManageFiles}
          >
            <span>{escaDataset.addFile}</span>
          </button>,
        ]);
      } else {
        actionButtons.push(
          <button
            class="btn--distribution fa fa-fw fa-files-o"
            title={escaDataset.manageFilesTitle}
            onmousedown={openManageFiles}
          >
            <span>{escaDataset.manageFiles}</span>
          </button>,
        );
      }
      actionButtons.push(
        <button
          className="btn--distribution fa fa-fw fa-chart-area"
          title={escaDataset.seeStatisticsTitle}
          onclick={openStatistics}
        >
          <span>{escaDataset.seeStatistics}</span>
        </button>,
      );
    } else if (isAPIDistribution(entry)) { // Add ApiInfo menu item,if its api distribution
      actionButtons.push([
        <button
          class="btn--distribution fa fa-fw fa-info-circle"
          title={escaDataset.apiDistributionTitle}
          onmousedown={actions.openApiInfo}
        >
          <span>{escaDataset.apiDistributionTitle}</span>
        </button>,
        <button
          class="btn--distribution  fa fa-fw fa-retweet"
          title={escaDataset.reGenerateAPITitle}
          onmousedown={refreshAPI}
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
            onmousedown={actions.openResource}
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
            onmousedown={actions.openResource}
          >
            <span>{escaDataset.downloadButtonTitle}</span>
          </button>,
        );
      }
    }

    actionButtons.push(
      <button
        class=" btn--distribution fa fa-fw fa-remove"
        title={escaDataset.removeDistributionTitle}
        onmousedown={removeDistribution}
      >
        <span>{escaDataset.removeDistributionTitle}</span>
      </button>,
    );

    return actionButtons;
  };

  return {
    view(vnode) {
      const { fileEntryURIs } = vnode.attrs;

      return (
        <div class=" icon--wrapper distribution--file">
          <Dropdown>
            { renderActions(distribution, fileEntryURIs) }
          </Dropdown>
        </div>
      );
    },
  };
};
