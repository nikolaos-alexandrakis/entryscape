import SuggestionActions from 'catalog/preparations/components/SuggestionActions';
import dateUtil from 'commons/util/dateUtil';
import { getModifiedDate, getTitle } from 'commons/util/metadata';
import { createSetState } from 'commons/util/util';
import './index.scss';

export default (initialVnode) => {
  const state = {
    isCollapsed: false,
  };
  const setState = createSetState(state);
  const collapseDatasetList = () => {
    const { onclick } = initialVnode.attrs;

    onclick();

    setState({
      isCollapsed: !state.isCollapsed,
    });
  };
  return {
    view(vnode) {
      const { entry, updateUpstream } = vnode.attrs;
      const title = getTitle(entry);
      const modificationDate = dateUtil.getMultipleDateFormats(getModifiedDate(entry));

      const hasDatasets = entry.getMetadata().find(entry.getResourceURI(), 'dcterms:references').length > 0;
      const onclick = hasDatasets ? collapseDatasetList : null;

      return <div
        onclick={onclick}
        className={'suggestionRow__main listRowBg'}>
        <div className="suggestionRow__name">
          {hasDatasets ? <span className={`fas fa-chevron-${state.isCollapsed ? 'down' : 'right'}`}/> : null}
          <span>{title}</span>
        </div>
        <div className="suggestionRow__actions">
          {hasDatasets && <span className="fas fa-cubes"/>}
          <span className="date">{modificationDate.short}</span>
          <SuggestionActions
            entry={entry}
            updateUpstream={updateUpstream}/>
        </div>
      </div>;
    },
  };
};
