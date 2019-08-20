import { getTitle } from 'commons/util/metadata';
import './index.scss';

/**
 *
 * @param entry
 */

export default () => {
  return {
    view(vnode) {
      const { entry } = vnode.attrs;
      const name = getTitle(entry);
      return <div className="linkSuggestionToDataset">
        <div className="mb-2 d-flex justify-content-between">
          <div className="datasetRowBg datasetRow__main d-flex justify-content-between">
            <div className="">
              <span>{name}</span>
            </div>
            <div className="datasetRow__content__statusInfo">
              <div className="datasetModificationDate">last may</div>
              <div className="commentCol">
                    <span className="badge badge-pill badge-primary"
                          style="cursor: pointer"
                    />
              </div>
            </div>
          </div>
          <div className="datasetRowBg datasetRow__action">
            <div className="datasetRow__action__icon">
              <i className="fas fa-link"/>
            </div>
          </div>
        </div>
      </div>;
    },
  };
};
