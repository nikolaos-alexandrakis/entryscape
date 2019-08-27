import escaPreparationsNLS from 'catalog/nls/escaPreparations.nls';
import Dropdown from 'commons/components/common/Dropdown';
import escoListNLS from 'commons/nls/escoList.nls';
import registry from 'commons/registry';
import DOMUtil from 'commons/util/htmlUtil';
import { i18n } from 'esi18n';
import m from 'mithril';
import bindActions from '../Suggestion/actions';

/**
 * Renders a list of action buttons that can be applied to a Suggestion
 */
export default (initialVnode) => {
  const {
    entry, updateParent = () => {
    },
    updateLists = () => {
    },
  } = initialVnode.attrs;
  const actions = bindActions(entry, DOMUtil.preventBubbleWrapper);
  const actionsUnbubbled = bindActions(entry);

  const editSuggestion = e => actions.editSuggestion(e);
  const linkToDataset = e => actions.linkToDataset(e);
  const editChecklist = e => actions.editChecklist(e, m.redraw);
  const deleteSuggestion = e => actions.remove(e, updateParent);
  const createDataset = e => actions.createDataset(e, updateParent);

  const archiveSuggestion = async () => {
    const success = await actionsUnbubbled.archiveSuggestion();
    if (success) {
      updateLists(entry, 'archive');
    }
  };

  const unArchiveSuggestion = async (e) => {
    const success = await actionsUnbubbled.unArchiveSuggestion(e);
    if (success) {
      updateLists(entry, 'unArchive');
    }
  };

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
        <div className="suggestionActions dropdownCog icon--wrapper">
          <Dropdown>
            {!isArchived && ([
              <li className="row__dropdownMenuItem" onclick={editSuggestion}>
                <div>
                  <i className="fas fa-fw fa-pencil-alt"/>
                  <span>{escoList.editEntry}</span>
                </div>
              </li>,
              <li className="row__dropdownMenuItem" onclick={linkToDataset}>
                <div>
                  <i className="fas fa-fw fa-link"/>
                  <span>{escaPreparations.linkDatasetMenu}</span>
                </div>
              </li>,
              <li className="row__dropdownMenuItem" onclick={createDataset}>
                <div>
                  <i className="fas fa-fw fa-cubes"/>
                  <span>{escaPreparations.createDatasetMenu}</span>
                </div>
              </li>,
              <li className="row__dropdownMenuItem" onclick={editChecklist}>
                <div>
                  <i className="fas fa-fw fa-check-square"/>
                  <span>{escaPreparations.progressMenu}</span>
                </div>
              </li>,
            ])}
            <li className="row__dropdownMenuItem" onclick={actions.editComments}>
              <div>
                <i className="fas fa-fw fa-comment"/>
                <span>{escaPreparations.commentMenu}</span>
              </div>
            </li>
            {!isArchived && (
              <li className="row__dropdownMenuItem" onclick={archiveSuggestion}>
                <div>
                  <i className="fas fa-fw fa-archive"/>
                  <span>{escaPreparations.archiveMenu}</span>
                </div>
              </li>
            )}
            {isArchived && (
              <li className="row__dropdownMenuItem" onclick={unArchiveSuggestion}>
                <div>
                  <i className="fas fa-fw fa-file-import"/>
                  <span>{escaPreparations.unArchiveMenu}</span>
                </div>
              </li>
            )}
            <li className="row__dropdownMenuItem" onclick={deleteSuggestion}>
              <div>
                <i className="fas fa-fw fa-times"/>
                <span>{escaPreparations.deleteMenu}</span>
              </div>
            </li>
          </Dropdown>
        </div>
      );
    },
  };
};
