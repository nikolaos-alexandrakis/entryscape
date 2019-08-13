import registry from 'commons/registry';
import dateUtil from 'commons/util/dateUtil';
import {
  getModifiedDate,
  getTitle,
} from 'commons/util/metadata';
import bindActions from './actions';
import './index.scss';

export default (vnode) => {
  const { entry, onRemove } = vnode.attrs;

  const actions = bindActions(entry);

  const siteManager = registry.get('siteManager');

  const removeDatasetReference = (e) => {
    const datasetURI = entry.getResourceURI();

    onRemove && onRemove(e, datasetURI); // TODO: @scazan figure better way to do bubble wrapper
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
          <a class="suggestionChild d-flex align-items-center" href={linkToDataset}>
            <p class="title flex-grow-1">
              <span class="fas fa-cubes"></span>
              <span class="text">{title}</span>
            </p>
            <p class="date">{modificationDate.short}</p>
            <div
              onclick={removeDatasetReference}
              className="remove fas fa-times"
            ></div>
          </a>
        </div>
      );
    },
  };
};
