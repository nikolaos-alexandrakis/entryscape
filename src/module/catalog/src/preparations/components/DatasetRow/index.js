import registry from 'commons/registry';
import dateUtil from 'commons/util/dateUtil';
import { getModifiedDate, getTitle } from 'commons/util/metadata';
import './index.scss';

export default (initialVnode) => {
  const { entry, onclick, isLinked } = initialVnode.attrs;

  // Works as either a 'link' or 'unlink' action depending on whether the dataset
  // is already linked with a suggestion.

  const onClickDataset = () => {
    const msg = isLinked ? 'are you sure?' : 'you must be joking!';
    return registry.get('dialogs').confirm(msg, 'Yes', 'Cancel', (confirm) => {
      if (!confirm) {
        return Promise.reject();
      }
      return onclick(entry.getResourceURI());
    });
  };

  return {
    view(vnode) {
      const { entry, isLinked = false } = vnode.attrs;
      const name = getTitle(entry);
      const modificationDate = dateUtil.getMultipleDateFormats(getModifiedDate(entry));

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
                <div className="ml-3"><i className="fas fa-info-circle"/></div>
              </div>
            </div>
          </div>
        </div>);
    },
  };
};
