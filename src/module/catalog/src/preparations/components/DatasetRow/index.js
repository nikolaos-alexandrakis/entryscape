import escaPreparationsNLS from 'catalog/nls/escaPreparations.nls';
import DatasetDialog from 'catalog/public/DatasetDialog';
import registry from 'commons/registry';
import dateUtil from 'commons/util/dateUtil';
import { getModifiedDate, getTitle } from 'commons/util/metadata';
import { i18n } from 'esi18n';
import './index.scss';

export default (initialVnode) => {
  const { entry, onclick, isLinked: isAlreadyLinked } = initialVnode.attrs;

  // Works as either a 'link' or 'unlink' action depending on whether the dataset
  // is already linked with a suggestion.
  const onClickDataset = () => {
    const escaPreparations = i18n.getLocalization(escaPreparationsNLS);
    const msg = isAlreadyLinked ?
      escaPreparations.linkDatasetConfirmQuestion : escaPreparations.unlinkDatasetConfirmQuestion;

    return registry.get('dialogs').confirm(
      msg,
      escaPreparations.linkDatasetConfirm,
      escaPreparations.linkSuggestionToDatasetCancel,
      (confirm) => {
        if (!confirm) {
          return Promise.reject();
        }
        return onclick(entry.getResourceURI());
      });
  };


  /**
   *
   * Open a dataset preview dialog with the current entry
   *
   * @param {MouseEvent} e
   */
  const onClickDatasetInfo = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const datasetDialogInfo = new DatasetDialog({
      destroyOnHide: true,
    });

    datasetDialogInfo.open({ row: { entry } });
  };

  return {
    view(vnode) {
      const { entry: datasetEntry, isLinked = false } = vnode.attrs;
      const name = getTitle(datasetEntry);
      const modificationDate = dateUtil.getMultipleDateFormats(getModifiedDate(datasetEntry));

      return (
        <div
          className="linkSuggestionToDataset"
          draggable="true"
          onclick={onClickDataset}>
          <div className="mb-2 d-flex justify-content-between">
            <div className={'datasetRowBg datasetRow__action'}>
              <div className={`datasetRow__action__icon ${isLinked ? 'active' : ''}`}>
                <i className="fas fa-link"/>
              </div>
            </div>
            <div className={'datasetRowBg datasetRow__main d-flex justify-content-between'}>
              <div className="datasetName">
                <span>{name}</span>
              </div>
              <div className="datasetRow__content__statusInfo d-flex justify-content-end align-content-center">
                <div className="datasetModificationDate ml-3">{modificationDate.short}</div>
                <div className="ml-3" onclick={onClickDatasetInfo}><i className="fas fa-info-circle"/></div>
              </div>
            </div>
          </div>
        </div>);
    },
  };
};
