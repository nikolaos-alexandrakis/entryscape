import DOMUtil from 'commons/util/htmlUtil';
import registry from 'commons/registry';
import escoListNLS from 'commons/nls/escoList.nls';
import escaPreparationsNLS from 'catalog/nls/escaPreparations.nls';
import Dropdown from 'commons/components/common/Dropdown';
import Button from 'commons/components/Button';
import { i18n } from 'esi18n';
import bindActions from '../Suggestion/actions';

/**
 * Renders a list of action buttons that can be applied to a Suggestion
 *
 * @returns {Mithril.Component}
 */
export default (vnode) => {
  const { entry, updateParent = () => {} } = vnode.attrs;
  const actions = bindActions(entry, DOMUtil.preventBubbleWrapper);

  const editSuggestion = e => actions.editSuggestion(e);
  const deleteSuggestion = e => actions.remove(e, updateParent);
  const createDataset = e => actions.createDataset(e, updateParent);
  const archiveSuggestion = e => actions.archiveSuggestion(e, updateParent);
  const unArchiveSuggestion = e => actions.unArchiveSuggestion(e, updateParent);

  const namespaces = registry.get('namespaces');
  const archived = entry
    .getEntryInfo()
    .getGraph()
    .findFirstValue(entry.getURI(), 'store:status') === namespaces.expand('esterms:archived');

  return {
    view() {
      const escaPreparations = i18n.getLocalization(escaPreparationsNLS);
      const escoList = i18n.getLocalization(escoListNLS);

      return (
        <div class="suggestionActions icon--wrapper">
          <Dropdown>
            {!archived && ([
              <Button onclick={editSuggestion} class="fas fa-fw fa-pencil-alt">{escoList.editEntry}</Button>,
              <Button onclick={editSuggestion}>{escaPreparations.linkDatasetMenu}</Button>,
              <Button onclick={createDataset}>{escaPreparations.createDatasetMenu}</Button>,
            ])}
            <Button onclick={actions.editComments}>{escaPreparations.commentMenu}</Button>

            {!archived && (
              <Button onclick={archiveSuggestion}>{escaPreparations.archiveMenu}</Button>
            )}
            {archived && (
              <Button onclick={unArchiveSuggestion}>{escaPreparations.unArchiveMenu}</Button>
            )}
            <Button onclick={deleteSuggestion}>{escaPreparations.deleteMenu}</Button>
          </Dropdown>
        </div>
      );
    },
  };
};
