import DatasetDialog from 'catalog/public/DatasetDialog';
import dateUtil from 'commons/util/dateUtil';
import { getModifiedDate, getTitle } from 'commons/util/metadata';
import './index.scss';

export default (initialVnode) => {
  const { entry: datasetEntry, onRemove } = initialVnode.attrs;

  /**
   * @param {MouseEvent} e
   */
  const removeDatasetReference = (e) => {
    const datasetURI = datasetEntry.getResourceURI();

    if (onRemove) {
      onRemove(e, datasetURI); // TODO: @scazan figure better way to do bubble wrapper
    }
  };

  /**
   *
   * @param {MouseEvent} e
   */
  const openDatasetInfoDialog = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const datasetDialogInfo = new DatasetDialog({
      destroyOnHide: true,
    });

    datasetDialogInfo.open({ row: { entry: datasetEntry } });
  };

  return {
    view(vnode) {
      const { entry } = vnode.attrs;
      const title = getTitle(entry);
      const modificationDate = dateUtil.getMultipleDateFormats(getModifiedDate(entry));

      return <div className="datasetRow d-flex align-items-center" onclick={openDatasetInfoDialog}>
        <div className="datasetRow__name title flex-grow-1">
          <span className="fas fa-cubes"/>
          <span className="text">{title}</span>
        </div>
        <div className="datasetRow__actions">
          <p className="date">{modificationDate.short}</p>
          <div
            onclick={removeDatasetReference}
            className="remove fas fa-times">
          </div>
        </div>
      </div>;
    },
  };
};
