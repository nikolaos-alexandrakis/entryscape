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
  const { entry, updateUpstream } = initialVnode.attrs;
  const actions = bindActions(entry, DOMUtil.preventBubbleWrapper);

  const editSuggestion = e => actions.editSuggestion(e, m.redraw);
  const linkToDataset = e => actions.linkToDataset(e, m.redraw);
  const editChecklist = e => actions.editChecklist(e, m.redraw);
  /**
   *
   * @param e
   * @param isArchive
   * @return {Promise<void>}
   */
  const deleteSuggestion = async (e, isArchive = false) => {
    const success = await actions.deleteSuggestion(e);
    if (success) {
      updateUpstream(entry, isArchive ? 'deleteArchive' : 'deleteSuggestion');
    }
  };
  /**
   *
   * @param e
   * @return {Promise<void>}
   */
  const deleteArchive = e => deleteSuggestion(e, true);

  /**
   *
   * @param e
   */
  const createDataset = e => actions.createDataset(e, datasetEntry => updateUpstream(datasetEntry, 'add'));

  /**
   *
   * @param e
   * @return {Promise<void>}
   */
  const archiveSuggestion = async (e) => {
    const success = await actions.archiveSuggestion(e);
    if (success) {
      updateUpstream(entry, 'archive');
    }
  };

  /**
   *
   * @param e
   * @return {Promise<void>}
   */
  const unArchiveSuggestion = async (e) => {
    const success = await actions.unArchiveSuggestion(e);
    if (success) {
      updateUpstream(entry, 'unArchive');
    }
  };

  const isArchived = entry
    .getEntryInfo()
    .getGraph()
    .findFirstValue(entry.getURI(), 'store:status') === registry.getNamespaces().expand('esterms:archived');

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
            <li className="row__dropdownMenuItem" onclick={isArchived ? deleteArchive : deleteSuggestion}>
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