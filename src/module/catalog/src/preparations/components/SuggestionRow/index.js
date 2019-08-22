import SuggestionActions from 'catalog/preparations/components/SuggestionActions';
import dateUtil from 'commons/util/dateUtil';
import { getModifiedDate, getTitle } from 'commons/util/metadata';
import './index.scss';

export default () => {
  return {
    view(vnode) {
      const { entry, updateParent, onclick } = vnode.attrs;
      const title = getTitle(entry);
      const modificationDate = dateUtil.getMultipleDateFormats(getModifiedDate(entry));

      const hasDatasets = entry.getMetadata().find(entry.getResourceURI(), 'dcterms:references').length > 0;

      return (
        <div
          onclick={onclick}
          className={'suggestionRow__main listRowBg d-flex justify-content-between align-items-center'}>
          <div className="suggestionRow__name">
            {hasDatasets ? <span className="fas fa-chevron-right"/> : null}
            <span>{title}</span>
          </div>
          <div className="suggestionRow__actions d-flex justify-content-end align-items-center">
            {hasDatasets && <span className="fas fa-cubes"/>}
            <span className="date">{modificationDate.short}</span>
            <SuggestionActions entry={entry} updateParent={updateParent}/>
          </div>
        </div>
      );
    },
  };
};
