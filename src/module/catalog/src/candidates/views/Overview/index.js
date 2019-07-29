import { i18n } from 'esi18n';
import registry from 'commons/registry';
import config from 'config';
import { createSetState } from 'commons/util/util';
import DOMUtil from 'commons/util/htmlUtil';
import escaPreparationsNLS from 'catalog/nls/escaPreparations.nls';
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
  };

  const setState = createSetState(state);

  const getEntries = () => {
    search().getEntries(0)
      .then(suggestions => setState({ suggestions }));
  };
  const reInitView = () => {
    setState({ suggestions: [] });
    getEntries();
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
        <div class="preparationsOverview entryList searchVisible" >

          <div class="listButtons float-right col-md-12">
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

            <div class="requests">
              <h2>Requests</h2>
              <div class="list">
                { state.suggestions.map(suggestion => (
                  <Suggestion
                    entry={suggestion}
                  />
                ))}
              </div>
            </div>
            <div class="suggestions">
              <h2>Suggestions</h2>
              <div class="list">
                { state.suggestions.map(suggestion => (
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
