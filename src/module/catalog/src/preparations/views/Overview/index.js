import escaPreparationsNLS from 'catalog/nls/escaPreparations.nls';
import Suggestion from 'catalog/preparations/components/Suggestion';
import Pagination from 'commons/components/common/Pagination';
import { paginationHandler } from 'commons/components/common/Pagination/util';
import SearchInput from 'commons/components/SearchInput';
import registry from 'commons/registry';
import DOMUtil from 'commons/util/htmlUtil';
import { createSetState, LIST_PAGE_SIZE_SMALL } from 'commons/util/util';
import config from 'config';
import { i18n } from 'esi18n';
import ListPlaceholder from '../../components/ListPlaceholder';
import bindActions from './actions';
import './index.scss';

/**
 *
 * @param {{ term: string, status: string, sortOrder: ''|undefined}} params
 * @returns {store|SearchList}
 */
const getFilteredEntries = (params) => {
  const { term = '', status = 'esterms:investigating' } = params;
  const context = registry.getContext();
  const namespaces = registry.getNamespaces();

  const qo = registry.getEntryStore()
    .newSolrQuery()
    .rdfType('esterms:Suggestion')
    .context(context)
    .status(namespaces.expand(status));

  if (term && term.length > 2) {
    if (config.get('entrystore.defaultSolrQuery') === 'all') {
      qo.all(term);
    } else {
      qo.title(term);
    }
  }

  qo.limit(LIST_PAGE_SIZE_SMALL);

  return qo.list();
};

export default () => {
  const actions = bindActions(null, DOMUtil.preventBubbleWrapper);

  const defaultState = {
    suggestions: [],
    suggestionPage: 0,
    suggestionSearchList: null,
    totalSuggestions: null,
    archives: [],
    archivePage: 0,
    archiveSearchList: null,
    totalArchives: null,
  };

  const state = { ...defaultState };

  const setState = createSetState(state);

  /**
   *
   * @param term
   * @param {string} name
   * @param {string} type
   * @return {store|SearchList}
   */
  const getCachedSearchList = (term, name, type) => {
    /** * @type {store|SearchList} */
    let searchList;

    if (state[name] == null) {
      searchList = getFilteredEntries({
        term,
        status: type,
      });

      const stateUpdateObject = {};
      stateUpdateObject[name] = searchList;
      setState(stateUpdateObject, true);
    } else {
      searchList = state[name];
    }

    return searchList;
  };

  /**
   *
   * @param term
   * @return {Promise<void>}
   */
  const getSuggestionEntries = async (term = null) => {
    const suggestionSearchList = getCachedSearchList(term, 'suggestionSearchList', 'esterms:investigating');

    const suggestions = await suggestionSearchList.getEntries(state.suggestionPage);

    setState({
      suggestions,
      totalSuggestions: suggestionSearchList.getSize(),
    });
  };

  /**
   *
   * @param term
   * @return {Promise<void>}
   */
  const getArchiveEntries = async (term = null) => {
    const archiveSearchList = getCachedSearchList(term, 'archiveSearchList', 'esterms:archived');

    const archives = await archiveSearchList.getEntries(state.archivePage);
    setState({
      archives,
      totalArchives: archiveSearchList.getSize(),
    });
  };

  const search = (term = null) => {
    setState({
      archiveSearchList: null,
      suggestionSearchList: null,
    }, true);

    return Promise.all([
      getArchiveEntries(term),
      getSuggestionEntries(term),
    ]);
  };

  const reInitView = () => {
    setState(defaultState);
    getArchiveEntries(); // Needs to be handled somewhat manually due to solr index
    getSuggestionEntries();
    // clearSearchField();
  };


  /**
   *
   * @param entry
   * @param {store/SearchList} list

   * @return {Promise<void>}
   */
  const addEntryToList = async (entry, list) => {
    await list.addEntry(entry);
    return list.getEntries(0);
  };

  /**
   *
   * @param entry
   * @param {store/SearchList} list
   * @return {Promise<void>}
   */
  const removeEntryFromList = async (entry, list, page) => {
    await list.removeEntry(entry);
    return list.getEntries(page);
  };

  /**
   * @param suggestionEntry
   * @return {Promise<void>}
   */
  const addSuggestion = async (suggestionEntry) => {
    const suggestions = await addEntryToList(suggestionEntry, state.suggestionSearchList);
    setState({
      suggestions,
      totalSuggestions: state.suggestionSearchList.getSize(),
    });
  };

  /**
   * @param archiveEntry
   * @return {Promise<void>}
   */
  const addArchive = async (archiveEntry) => {
    const archives = await addEntryToList(archiveEntry, state.archiveSearchList);
    setState({
      archives,
      totalArchives: state.archiveSearchList.getSize(),
    });
  };

  /**
   *
   * @param {MouseEvent} e
   */
  const createSuggestion = e => actions.createSuggestion(e, (newSuggestion) => {
    setState({
      suggestionPage: 0,
    }, true);
    return addSuggestion(newSuggestion);
  });

  /**
   *
   * @param suggestionEntry
   * @return {Promise<void>}
   */
  const removeSuggestion = async (suggestionEntry) => {
    const suggestions = await removeEntryFromList(suggestionEntry, state.suggestionSearchList, state.suggestionPage);
    setState({
      suggestions,
      totalSuggestions: state.suggestionSearchList.getSize(),
    });
  };

  /**
   *
   * @param archiveEntry
   * @return {Promise<void>}
   */
  const removeArchive = async (archiveEntry) => {
    const archives = await removeEntryFromList(archiveEntry, state.archiveSearchList, state.archivePage);
    setState({
      archives,
      totalArchives: state.archiveSearchList.getSize(),
    });
  };

  /**
   *
   * @param suggestionEntry
   * @param action
   * @return {Promise<void>}
   */
  const updateLists = async (suggestionEntry, action) => {
    switch (action) {
      case 'archive':
        await removeSuggestion(suggestionEntry);
        await addArchive(suggestionEntry);
        break;
      case 'unArchive':
        await removeArchive(suggestionEntry);
        await addSuggestion(suggestionEntry);
        break;
      case 'deleteSuggestion':
        await removeSuggestion(suggestionEntry);
        break;
      case 'deleteArchive':
        await removeArchive(suggestionEntry);
        break;
      default:
    }
  };

  /**
   *
   * @param page
   * @return {*}
   */
  const paginateArchiveList = page => paginationHandler(page, 'archivePage', setState, getArchiveEntries);

  /**
   *
   * @param page
   * @return {*}
   */
  const paginateSuggestionList = page => paginationHandler(page, 'suggestionPage', setState, getSuggestionEntries);

  return {
    oninit: reInitView,
    view() {
      const escaPreparations = i18n.getLocalization(escaPreparationsNLS);
      const hasSuggestions = state.suggestions && state.suggestions.length;
      const hasArchives = state.archives && state.archives.length;

      return (
        <div className="preparationsOverview searchVisible">
          <div className="row">
            <div className="listButtons col">
              <div className="row">
                <SearchInput
                  onchangeSearch={search}
                  placeholder={escaPreparations.listSearchPlaceholder}
                  columnWidth="col"
                />
                <div className="col flex-row-reverse d-flex align-items-end">
                  <button
                    type="button"
                    className="float-right btn btn-raised btn-primary ml-2"
                    title={escaPreparations.createSuggestionPopoverTitle}
                    onclick={createSuggestion}
                  >
                    <span aria-hidden="true" className="fas fa-plus"/>
                    <span className="escoList__buttonLabel">{escaPreparations.createSuggestion}</span>
                  </button>
                  <button
                    type="button"
                    className="float-right btn btn-raised btn-secondary ml-2"
                    title="Reload list"
                    onclick={reInitView}
                  >
                    <span aria-hidden="true" className="fas fa-sync"/>
                    <span className="escoList__buttonLabel"/>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="suggestions">
            <h1>
              <span className="fas fa-file-signature"/>
              {escaPreparations.suggestionListTitle}
            </h1>
            <div className="list">
              {(state.totalSuggestions == null) && <div className="placeholder"/>}
              {hasSuggestions ? state.suggestions.map(suggestion => (
                <Suggestion
                  key={suggestion.getId()}
                  entry={suggestion}
                  updateUpstream={updateLists}
                />
              )) : <ListPlaceholder label={escaPreparations.suggestionEmptyList}/>}
              {(state.totalSuggestions > LIST_PAGE_SIZE_SMALL) && <Pagination
                currentPage={state.suggestionPage}
                totalCount={state.totalSuggestions}
                pageSize={LIST_PAGE_SIZE_SMALL}
                handleChangePage={paginateSuggestionList}
              />}
            </div>
          </div>
          <div className="archive">
            <h1>
              <span className="fas fa-file-archive"/>
              {escaPreparations.archiveListTitle}
            </h1>

            <div className="suggestions">
              <div className="list">
                {(state.totalArchives == null) && <div className="placeholder"/>}
                {hasArchives ? state.archives.map(suggestion => (
                  <Suggestion
                    key={suggestion.getId()}
                    entry={suggestion}
                    updateUpstream={updateLists}
                  />
                )) : <ListPlaceholder label={escaPreparations.archiveEmptyList}/>}
                {(state.totalArchives > LIST_PAGE_SIZE_SMALL) && <Pagination
                  currentPage={state.archivePage}
                  totalCount={state.totalArchives}
                  pageSize={LIST_PAGE_SIZE_SMALL}
                  handleChangePage={paginateArchiveList}
                />}
              </div>
            </div>
          </div>
        </div>
      );
    },
  };
};