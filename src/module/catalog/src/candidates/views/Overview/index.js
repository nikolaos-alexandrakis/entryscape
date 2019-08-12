import { i18n } from 'esi18n';
import registry from 'commons/registry';
import config from 'config';
import { createSetState } from 'commons/util/util';
import DOMUtil from 'commons/util/htmlUtil';
import escaPreparationsNLS from 'catalog/nls/escaPreparations.nls';
import SearchInput from 'commons/components/SearchInput';
import Suggestion from 'catalog/candidates/components/Suggestion';
import bindActions from './actions';
import './index.scss';

const buttons = [
  {
    name: 'create',
    button: 'primary',
    icon: 'plus',
    iconType: 'fa',
    max: 2,
    // max: this.createLimit,
    disableOnSearch: false,
    nlsKey: 'createCandidate',
    nlsKeyTitle: 'createCandidatePopoverTitle',
    nlsKeyMessage: 'createCandidatePopoverMessage',
  },
];

const getSearchObject = () => registry.get('entrystore')
  .newSolrQuery()
  .rdfType('esterms:Suggestion')
  .context(registry.get('context'));

const search = (paramsParams) => {
  const params = paramsParams || {};
  const qo = getSearchObject();

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

  if (config.entrystore.defaultSolrLimit) {
    qo.limit(config.entrystore.defaultSolrLimit);
  }

  const list = registry.get('entrystore')
    .createSearchList(qo);

  return list;

  // this.listView.showEntryList(list);
};

export default () => {
  const actions = bindActions(null, DOMUtil.preventBubbleWrapper);

  const state = {
    suggestions: [],
    archives: [],
  };

  const setState = createSetState(state);

  const getEntries = (term = null) => {
    const ns = registry.get('namespaces');

    search({term})
      .getEntries(0)
      .then((suggestions) => {
        const allEntries = suggestions
          .reduce((accum, suggestion) => {
            const entryInfoGraph = suggestion.getEntryInfo().getGraph();

            if (
              entryInfoGraph
                .findFirstValue(suggestion.getResourceURI(), 'store:status') === ns.expand('esterms:archived')
            ) {
              accum.archives.push(suggestion);
              return accum;
            }

            accum.suggestions.push(suggestion);
            return accum;
          }, {
            suggestions: [],
            archives: [],
          });
        setState({
          suggestions: allEntries.suggestions,
          archives: allEntries.archives,
        });
      });
  };

  const reInitView = () => {
    setState({ suggestions: [] });
    getEntries(); // Needs to be handled somewhat manually due to solr index
  };

  const createSuggestion = e => actions.createSuggestion(e, newSuggestion => setState({
    suggestions: [...state.suggestions, newSuggestion],
  }));

  return {
    oninit() {
      getEntries();
    },
    view() {
      const escaPreparations = i18n.getLocalization(escaPreparationsNLS);

      return (
        <div class="preparationsOverview searchVisible" >
          <div class="listButtons float-right col-md-12">
            <SearchInput onchangeSearch={getEntries}/>
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
                  />
                ))}
              </div>
            </div>

          </div>

        </div>
      );
    },
  };
};
