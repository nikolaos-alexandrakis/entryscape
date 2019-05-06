import {
  isAccessURLEmpty,
  isAPIDistribution,
  isDownloadURLEmpty,
  isFileDistributionWithOutAPI,
  isSingleFileDistribution,
  isUploadedDistribution,
} from 'catalog/datasets/utils/distributionUtil';
import escaDatasetNLS from 'catalog/nls/escaDataset.nls';
import Dropdown from 'commons/components/common/Dropdown';
import escoListNLS from 'commons/nls/escoList.nls';
import registry from 'commons/registry';
import DOMUtil from 'commons/util/htmlUtil';
import { i18n } from 'esi18n';
import bindActions from './actions';

/**
 * Renders a list of action buttons that can be applied to a distribution
 *
 * @returns {undefined}
 */
export default (initialVnode) => {
  const { distribution, dataset, refreshDistributions = () => {} } = initialVnode.attrs;
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

    const statisticsVnode = (<button
      className="btn--distribution fas fa-fw fa-chart-area"
      title={escaDataset.seeStatisticsTitle}
      onclick={openStatistics}
    >
      <span>{escaDataset.seeStatistics}</span>
    </button>);

    actionButtons.push(
      <button
        className="btn--distribution fas fa-fw fa-pencil-alt"
        onclick={editDistribution}
      >
        <span>{escaDataset.editDistributionTitle}</span>
      </button>,
    );

    if (distribution.getEntryInfo().hasMetadataRevisions()) {
      actionButtons.push(
        <button
          className=" btn--distribution fas fa-fw fa-bookmark"
          title={escoList.versionsTitle}
          onclick={actions.openRevisions}
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
            className="btn--distribution fas fa-fw fa-link"
            title={escaDataset.apiActivateTitle}
            onclick={activateAPI}
          >
            <span>{escaDataset.apiActivateTitle}</span>
          </button>,
        );
      }
      if (isSingleFileDistribution(entry)) {
        actionButtons.push([
          <button
            className="btn--distribution fas fa-fw fa-download"
            title={escaDataset.downloadButtonTitle}
            onclick={actions.openResource}
          >
            <span>{escaDataset.downloadButtonTitle}</span>
          </button>,
          <button
            className="btn--distribution fas fa-fw fa-exchange-alt"
            title={escaDataset.replaceFileTitle}
            onclick={openReplaceFile}
          >
            <span>{escaDataset.replaceFile}</span>
          </button>,
          <button
            className="btn--distribution fas fa-fw fa-file"
            title={escaDataset.addFileTitle}
            onclick={openManageFiles}
          >
            <span>{escaDataset.addFile}</span>
          </button>,
        ]);
      } else {
        actionButtons.push(
          <button
            className="btn--distribution fas fa-fw fa-file"
            title={escaDataset.manageFilesTitle}
            onclick={openManageFiles}
          >
            <span>{escaDataset.manageFiles}</span>
          </button>,
        );
      }
      actionButtons.push(statisticsVnode);
    } else if (isAPIDistribution(entry)) { // Add ApiInfo menu item,if its api distribution
      actionButtons.push([
        <button
          className="btn--distribution fas fa-fw fa-info-circle"
          title={escaDataset.apiDistributionTitle}
          onclick={actions.openApiInfo}
        >
          <span>{escaDataset.apiDistributionTitle}</span>
        </button>,
        <button
          className="btn--distribution fas fa-fw fa-retweet"
          title={escaDataset.reGenerateAPITitle}
          onclick={refreshAPI}
        >
          <span>{escaDataset.reGenerateAPI}</span>
        </button>,
        statisticsVnode,
      ]);
    } else {
      if (!isAccessURLEmpty(entry)) {
        actionButtons.push(
          <button
            className="btn--distribution fas fa-fw fa-info-circle"
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
            className="btn--distribution  fas fa-fw fa-download"
            title={escaDataset.downloadButtonTitle}
            onclick={actions.openResource}
          >
            <span>{escaDataset.downloadButtonTitle}</span>
          </button>,
        );
      }
    }

    actionButtons.push(
      <button
        className=" btn--distribution fas fa-fw fa-times"
        title={escaDataset.removeDistributionTitle}
        onclick={removeDistribution}
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
        <div className=" icon--wrapper distribution--file">
          <Dropdown>
            {renderActions(distribution, fileEntryURIs)}
          </Dropdown>
        </div>
      );
    },
  };
};
