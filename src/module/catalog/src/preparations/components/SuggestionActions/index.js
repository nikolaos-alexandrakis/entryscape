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
  const linkToDataset = e => actions.linkToDataset(e);
  const deleteSuggestion = e => actions.remove(e, updateParent);
  const createDataset = e => actions.createDataset(e, updateParent);
  const archiveSuggestion = e => actions.archiveSuggestion(e, updateParent);
  const unArchiveSuggestion = e => actions.unArchiveSuggestion(e, updateParent);

  const namespaces = registry.get('namespaces');
  const isArchived = entry
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
            {!isArchived && ([
              <Button onclick={editSuggestion} class="fas fa-fw fa-pencil-alt">{escoList.editEntry}</Button>,
              <Button onclick={linkToDataset} class="fas fa-fw fa-link">{escaPreparations.linkDatasetMenu}</Button>,
              <Button onclick={createDataset} class="fas fa-fw fa-cubes">{escaPreparations.createDatasetMenu}</Button>,
            ])}
            <Button onclick={actions.editComments} class="fas fa-fw fa-comment">
              {escaPreparations.commentMenu}
            </Button>

            {!isArchived && (
              <Button onclick={archiveSuggestion} class="fas fa-fw fa-archive">
                {escaPreparations.archiveMenu}
              </Button>
            )}
            {isArchived && (
              <Button onclick={unArchiveSuggestion} class="fas fa-fw fa-file-import">
                {escaPreparations.unArchiveMenu}
              </Button>
            )}
            <Button onclick={deleteSuggestion} class="fas fa-fw fa-times">
              {escaPreparations.deleteMenu}
            </Button>
          </Dropdown>
        </div>
      );
    },
  };
};
