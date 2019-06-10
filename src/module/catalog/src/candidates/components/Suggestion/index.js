import { i18n } from 'esi18n';
import dateUtil from 'commons/util/dateUtil';
import { createSetState } from 'commons/util/util';
import {
  getTitle,
  getModifiedDate,
  getDescription,
} from 'commons/util/metadata';
import escaDatasetNLS from 'catalog/nls/escaDataset.nls';
// import bindActions from '../DistributionActions/actions';
import SuggestionDataset from '../SuggestionDataset';
import SuggestionRequest from '../SuggestionRequest';
import SuggestionActions from '../SuggestionActions';
import './index.scss';

export default (vnode) => {
  const { entry } = vnode.attrs;
  const state = {
    isExpanded: false,
  };
  const setState = createSetState(state);
  // const actions = bindActions(distribution, dataset);

  const expandDistribution = () => {
    setState({
      isExpanded: !state.isExpanded,
    });
  };

  const editSuggestion = (e) => {
    const target = e.target;
    const isDropdownClick = vnode.dom.querySelector('.ESDropdown').contains(target);
    if (!isDropdownClick) {
      actions.editDistribution(() => m.redraw());
    }
  };

  return {
    view(vnode) {
      const { entry, showChildren = true } = vnode.attrs;
      const title = getTitle(entry);
      const modificationDate = dateUtil.getMultipleDateFormats(getModifiedDate(entry));
      const description = getDescription(entry);

      const expandedClass = state.isExpanded ? 'expanded' : '';
      const distributionArrowClass = state.isExpanded ? 'fas fa-angle-up' : 'fas fa-angle-down';

      return (
        <div class="suggestion">
          <div class="progressBar">
          </div>
          <div onclick={expandDistribution} tabindex="0" class="row">
            <div class={distributionArrowClass}></div>
            <p class="distribution__title">{title}</p>
            <div class="flex--sb">
              <p class="date">{modificationDate.short}</p>
              <SuggestionActions entry={entry} />
            </div>
            <div class={`distribution__expand ${expandedClass}`}>
              <SuggestionRequest entry={entry} />
              <SuggestionDataset entry={entry} />
            </div>
          </div>
        </div>
      );
    },
  };
};
