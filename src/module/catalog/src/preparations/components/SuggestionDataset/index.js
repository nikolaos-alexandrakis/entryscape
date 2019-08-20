import registry from 'commons/registry';
import dateUtil from 'commons/util/dateUtil';
import { getModifiedDate, getTitle } from 'commons/util/metadata';
import './index.scss';

export default (initialVnode) => {
  const { entry, onRemove } = initialVnode.attrs;

  const siteManager = registry.get('siteManager');

  const removeDatasetReference = (e) => {
    const datasetURI = entry.getResourceURI();

    if (onRemove) {
      onRemove(e, datasetURI); // TODO: @scazan figure better way to do bubble wrapper
    }
  };

  return {
    view(vnode) {
      const { entry } = vnode.attrs;
      const title = getTitle(entry);
      const modificationDate = dateUtil.getMultipleDateFormats(getModifiedDate(entry));
      const linkToDataset = siteManager.getViewPath('catalog__datasets__dataset', {
        context: entry.getContext().getId(),
        dataset: entry.getId(),
      });

      return (
        <div>
          <a className="suggestionChild d-flex align-items-center" href={linkToDataset}>
            <p className="title flex-grow-1">
              <span className="fas fa-cubes"/>
              <span className="text">{title}</span>
            </p>
            <p className="date">{modificationDate.short}</p>
            <div
              onclick={removeDatasetReference}
              className="remove fas fa-times">
            </div>
          </a>
        </div>
      );
    },
  };
};
