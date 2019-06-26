import { i18n } from 'esi18n';
import registry from 'commons/registry';
import config from 'config';
import { createSetState } from 'commons/util/util';
import escaCandidatesNLS from 'catalog/nls/escaCandidates.nls';
import Suggestion from 'catalog/candidates/components/Suggestion';
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
  .rdfType('esterms:CandidateDataset')
  .context(registry.get('context'));

const getTemplate = () => registry.get('itemstore')
  .getItem(config.catalog.datasetCandidateTemplateId);

const getTemplateLevel = () => {
  return 'recommended';
};

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

export default () =>  {

  const state = {
    suggestions: [],
  };
  const setState = createSetState(state);

  return {

    oninit() {
      const list = search().getEntries(0)
        // .then(sugg => {
          // console.log(sugg);
          // return sugg;
        // })
        .then(suggestions => setState({ suggestions }));
    },
    view() {
      const escaCandidates = i18n.getLocalization(escaCandidatesNLS);

      return (
        <div class="preparationsOverview entryList searchVisible" >

          <div class="suggestions">
            <h1>
              <span class="fas fa-file-signature"></span>
              Suggestions
            </h1>
            <div class="list">
              { state.suggestions.map(suggestion => (
                <Suggestion
                  entry={suggestion}
                />
              ))}
            </div>
          </div>
          <div class="archive">
            <h1>Archive</h1>

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
