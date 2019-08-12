import { i18n } from 'esi18n';
import registry from 'commons/registry';
import config from 'config';
import { createSetState, LIST_PAGE_SIZE_SMALL } from 'commons/util/util';
import DOMUtil from 'commons/util/htmlUtil';
import escaPreparationsNLS from 'catalog/nls/escaPreparations.nls';
import SearchInput from 'commons/components/SearchInput';
import Pagination from 'commons/components/common/Pagination';
import Suggestion from 'catalog/candidates/components/Suggestion';
import bindActions from './actions';
import './index.scss';

const ns = registry.get('namespaces');

const getSearchObject = () => registry.get('entrystore')
  .newSolrQuery()
  .rdfType('esterms:Suggestion')
  .context(registry.get('context'));

const getFilteredEntries = (params = { status: 'esterms:investigating' }) => {
  const qo = getSearchObject()
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

  qo.limit(LIST_PAGE_SIZE_SMALL); // @scazan pre-fetch 3 pages worth

  const list = registry.get('entrystore')
    .createSearchList(qo);

  return list;
};

export default () => {
  const actions = bindActions(null, DOMUtil.preventBubbleWrapper);

  const state = {
    suggestions: [],
    suggestionPage: 0,
    totalSuggestions: 0,
    archives: [],
    archivePage: 0,
    totalArchives: 0,
  };

  const setState = createSetState(state);

  const getSuggestionEntries = (term = null) => {
    const searchList = getFilteredEntries({
      term,
      status: 'esterms:investigating',
    });

    searchList
      .getEntries(state.suggestionPage)
      .then((suggestions) => {
        setState({ suggestions: [] }); // @scazan Needing to empty the array to trigger a redraw
        setState({
          suggestions,
          totalSuggestions: searchList.getSize(),
        });
      });
  };

  const getArchiveEntries = (term = null) => {
    const searchList = getFilteredEntries({
      term,
      status: 'esterms:archived',
    });

    searchList
      .getEntries(state.archivePage)
      .then(archives => setState({
        archives,
        totalArchives: searchList.getSize(),
      }));
  };

  const search = (term = null) => {
    getArchiveEntries(term);
    getSuggestionEntries(term);
  };

  const reInitView = () => {
    setState({ suggestions: [] });
    getArchiveEntries(); // Needs to be handled somewhat manually due to solr index
    getSuggestionEntries();
  };

  const createSuggestion = e => actions.createSuggestion(e, newSuggestion => setState({
    suggestions: [...state.suggestions, newSuggestion],
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
        <div class="preparationsOverview searchVisible" >
          <div class="listButtons float-right col-md-12">
            <SearchInput onchangeSearch={search}/>
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

          <div class="suggestions">
            <h1>
              <span class="fas fa-file-signature"></span>
              Suggestions
            </h1>
            <div class="list">
              { state.suggestions.map(suggestion => (
                <Suggestion
                  entry={suggestion}
                  updateParent={reInitView}
                />
              ))}
              <Pagination
                currentPage={state.suggestionPage}
                totalCount={state.totalSuggestions}
                pageSize={LIST_PAGE_SIZE_SMALL}
                handleChangePage={paginateSuggestionList}
              />
            </div>
          </div>
          <div class="archive">
            <h1>
              <span class="fas fa-file-archive"></span>
              Archive
            </h1>

            <div class="suggestions">
              <div class="list">
                { state.archives.map(suggestion => (
                  <Suggestion
                    entry={suggestion}
                    updateParent={reInitView}
                  />
                ))}
                <Pagination
                  currentPage={state.archivePage}
                  totalCount={state.totalArchives}
                  pageSize={LIST_PAGE_SIZE_SMALL}
                  handleChangePage={paginateArchiveList}
                />
              </div>
            </div>

          </div>

        </div>
      );
    },
  };
};
