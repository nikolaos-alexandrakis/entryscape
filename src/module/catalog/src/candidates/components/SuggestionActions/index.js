import DOMUtil from 'commons/util/htmlUtil';
import escoListNLS from 'commons/nls/escoList.nls';
import escaPreparationsNLS from 'catalog/nls/escaPreparations.nls';
import Dropdown from 'commons/components/common/Dropdown';
import Button from 'commons/components/Button';
import { i18n } from 'esi18n';
import bindActions from './actions';

/**
 * Renders a list of action buttons that can be applied to a Suggestion
 *
 * @returns {Mithril.Component}
 */
export default (vnode) => {
  const { entry, refresh = () => {} } = vnode.attrs;
  const actions = bindActions(entry, DOMUtil.preventBubbleWrapper);

  const editSuggestion = e => actions.editSuggestion(e);
  const deleteSuggestion = e => actions.removeSuggestion(e, m.render);

  return {
    view(vnode) {
      const escaPreparations = i18n.getLocalization(escaPreparationsNLS);
      const escoList = i18n.getLocalization(escoListNLS);

      return (
        <div class=" icon--wrapper">
          <Dropdown>
            <Button onclick={editSuggestion}>{escoList.editEntry}</Button>
            <Button onclick={editSuggestion}>{escaPreparations.linkDatasetMenu}</Button>
            <Button onclick={editSuggestion}>{escaPreparations.createDatasetMenu}</Button>
            <Button onclick={editSuggestion}>{escaPreparations.commentMenu}</Button>
            <Button onclick={editSuggestion}>{escaPreparations.archiveMenu}</Button>
            <Button onclick={deleteSuggestion}>{escaPreparations.deleteMenu}</Button>
          </Dropdown>
        </div>
      );
    },
  };
};
