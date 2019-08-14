import { i18n } from 'esi18n';
import registry from 'commons/registry';
import config from 'config';
import { createSetState, LIST_PAGE_SIZE_SMALL } from 'commons/util/util';
import DOMUtil from 'commons/util/htmlUtil';
import escaPreparationsNLS from 'catalog/nls/escaPreparations.nls';
import SearchInput from 'commons/components/SearchInput';
import Pagination from 'commons/components/common/Pagination';
import Suggestion from 'catalog/preparations/components/Suggestion';
import bindActions from './actions';
import './index.scss';

const ns = registry.get('namespaces');

const getSolrQuery = () => registry.get('entrystore')
  .newSolrQuery()
  .rdfType('esterms:Suggestion')
  .context(registry.get('context'));

const getFilteredEntries = (params = { status: 'esterms:investigating' }) => {
  const qo = getSolrQuery()
    .status(ns.expand(params.status));

  if (params.sortOrder === 'title') {
    const l = this.useNoLangSort ? 'nolang' : i18n.getLocale();
    qo.sort(`title.${l}+asc`);
  } else {
    qo.sort('modified+desc');
  }

  if (params.term != null && params.term.length > 0) {
    if (config.entrystore.defaultSolrQuery === 'all') {
      qo.all(params.term);
    } else {
      qo.title(params.term);
    }
  }

  qo.limit(LIST_PAGE_SIZE_SMALL);

  const list = qo.list();

  return list;
};

export default () => {
  const actions = bindActions(null, DOMUtil.preventBubbleWrapper);

  const state = {
    suggestions: [],
    suggestionPage: 0,
    totalSuggestions: null,
    archives: [],
    archivePage: 0,
    totalArchives: null,
  };

  const setState = createSetState(state);

  let suggestionSearchList = null;
  const getSuggestionEntries = (term = null) => {
    suggestionSearchList = !suggestionSearchList ? getFilteredEntries({
      term,
      status: 'esterms:investigating',
    }) : suggestionSearchList;

    suggestionSearchList
      .getEntries(state.suggestionPage)
      .then(suggestions => setState({
        suggestions,
        totalSuggestions: suggestionSearchList.getSize(),
      }));
  };

  let archiveSearchList = null;
  const getArchiveEntries = (term = null) => {
    archiveSearchList = !archiveSearchList ? getFilteredEntries({
      term,
      status: 'esterms:archived',
    }) : archiveSearchList;

    archiveSearchList
      .getEntries(state.archivePage)
      .then(archives => setState({
        archives,
        totalArchives: archiveSearchList.getSize(),
      }));
  };

  const search = (term = null) => {
    archiveSearchList = null;
    suggestionSearchList = null;
    getArchiveEntries(term);
    getSuggestionEntries(term);
  };

  const reInitView = () => {
    setState({ suggestions: [] });
    getArchiveEntries(); // Needs to be handled somewhat manually due to solr index
    getSuggestionEntries();
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
    oninit() {
      reInitView();
    },
    view() {
      const escaPreparations = i18n.getLocalization(escaPreparationsNLS);

      return (
        <div class="preparationsOverview entryList searchVisible" >
          <div class="row">
            <div class="listButtons row col">

              <SearchInput
                onchangeSearch={search}
                placeholder={escaPreparations.listSearchPlaceholder}
                columnWidth="col"
              />
              <div class="col flex-row-reverse d-flex align-items-end">
                <button
                  type="button"
                  class="float-right btn btn-raised btn-primary"
                  title={escaPreparations.createSuggestionPopoverTitle}
                  onclick={createSuggestion}
                >
                  <span aria-hidden="true" class="fas fa-plus"></span>
                  <span className="escoList__buttonLabel">{escaPreparations.createSuggestion}</span>
                </button>
                <button type="button" class="float-right btn btn-raised btn-secondary" title="Reload list">
                  <span aria-hidden="true" class="fas fa-sync"></span>
                  <span className="escoList__buttonLabel"></span>
                </button>
              </div>
            </div>
          </div>

          <div class="suggestions">
            <h1>
              <span class="fas fa-file-signature"></span>
              Suggestions
            </h1>
            <div class="list">
              { (state.totalSuggestions == null) &&
                <div class="placeholder"></div>
              }
              { state.suggestions.map(suggestion => (
                <Suggestion
                  key={suggestion.getId()}
                  entry={suggestion}
                  updateParent={reInitView}
                />
              ))}
              {(state.totalSuggestions > LIST_PAGE_SIZE_SMALL) && <Pagination
                currentPage={state.suggestionPage}
                totalCount={state.totalSuggestions}
                pageSize={LIST_PAGE_SIZE_SMALL}
                handleChangePage={paginateSuggestionList}
              />}
              
            </div>
          </div>
          <div class="archive">
            <h1>
              <span class="fas fa-file-archive"></span>
              Archive
            </h1>

            <div class="suggestions">
              <div class="list">
                { (state.totalArchives == null) &&
                  <div class="placeholder"></div>
                }
                { state.archives.map(suggestion => (
                  <Suggestion
                    key={suggestion.getId()}
                    entry={suggestion}
                    updateParent={reInitView}
                  />
                ))}
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
