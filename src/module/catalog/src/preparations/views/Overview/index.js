import escaPreparationsNLS from 'catalog/nls/escaPreparations.nls';
import Suggestion from 'catalog/preparations/components/Suggestion';
import Pagination from 'commons/components/common/Pagination';
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
  const { term = '', status = 'esterms:investigating', sortOrder = '' } = params;
  const context = registry.getContext();
  const namespaces = registry.getNamespaces();

  const qo = registry.getEntryStore()
    .newSolrQuery()
    .rdfType('esterms:Suggestion')
    .context(context)
    .status(namespaces.expand(status));

  if (sortOrder === 'title') {
    const l = this.useNoLangSort ? 'nolang' : i18n.getLocale();
    qo.sort(`title.${l}+asc`);
  } else {
    qo.sort('modified+desc');
  }

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
    getArchiveEntries(term);
    getSuggestionEntries(term);
  };

  const clearSearchField = () => {

  }

  const reInitView = () => {
    setState(defaultState);
    getArchiveEntries(); // Needs to be handled somewhat manually due to solr index
    getSuggestionEntries();
    clearSearchField();
  };

  const createSuggestion = e => actions.createSuggestion(e, newSuggestion => setState({
    suggestions: [newSuggestion, ...state.suggestions],
  }));

  const paginateArchiveList = (newPage) => {
    setState({
      archivePage: newPage,
    });

    getArchiveEntries();
  };

  const paginateSuggestionList = (newPage) => {
    setState({
      suggestionPage: newPage,
    });

    getSuggestionEntries();
  };

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
              {(state.totalSuggestions == null) &&
              <div className="placeholder"/>
              }
              {hasSuggestions ? state.suggestions.map(suggestion => (
                <Suggestion
                  key={suggestion.getId()}
                  entry={suggestion}
                  updateParent={reInitView}
                />
              )) : <ListPlaceholder label={escaPreparations.suggestionEmptyList} />}
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
                {(state.totalArchives == null) &&
                <div className="placeholder"/>
                }
                {hasArchives ? state.archives.map(suggestion => (
                  <Suggestion
                    key={suggestion.getId()}
                    entry={suggestion}
                    updateParent={reInitView}
                  />
                )) : <ListPlaceholder label={escaPreparations.archiveEmptyList} />}
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
