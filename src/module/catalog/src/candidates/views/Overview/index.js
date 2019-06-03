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
        <div class="entryList searchVisible" >
          <div class="panel panel-default" data-dojo-attach-point="listHeaderS">
            <div class="panel-heading" data-dojo-attach-point="head">
              <div class="row headerinfo alert alert-info" data-dojo-attach-point="headerInfo">
                <span data-dojo-attach-point="listInfo"></span>
              </div>
              <div class="row rowOneEntryList" data-dojo-attach-point="headBlock">
                <div data-dojo-attach-point="buttonContainer" class="listButtons pull-right">
                  {buttons.map(params =>
                    <button class={`pull-right btn btn-raised btn-${params.button}`}>
                      <span
                        class={`fas fa-${params.icon}`}
                        aria-hidden="true"
                      >
                      </span>
                      <span class="escoList__buttonLabel">
                        &nbsp;{escaCandidates[params.nlsKey]}
                      </span>
                    </button>
                  )}
                </div>
              </div>
              <div class="searchBlock" style="display: none" data-dojo-attach-point="searchBlock">
                <div class="col-md-8 col-sm-6">
                  <div data-dojo-attach-point="searchBlockInner"
                    class="form-group has-feedback searchBlockInner"
                  >
                    <div class="input-group">
                      <input type="text" class="form-control"
                        data-dojo-attach-point="searchTermNode"/>
                      <span class="input-group-btn">
                        <button class="btn btn-default searchButton" type="button" data-dojo-attach-point="nls" title="listSearchButton" aria-label="Search">
                          <span data-dojo-attach-point="nls" class="screenreader__span">listSearchButton</span>
                          <span class="fas fa-search" aria-hidden="true">
                          </span>
                        </button>
                      </span>
                    </div>

                    <span class="fa form-control-feedback"
                      data-dojo-attach-point="searchIconFeedback"
                      style="right: 40px;z-index: 3">
                    </span>
                    <span class="help-block escoList--Help"
                      data-dojo-attach-point="tooShortSearch"
                      style="display:none;font-size: 14px">
                    </span>
                    <span class="help-block escoList--Help"
                      data-dojo-attach-point="invalidSearch"
                      style="display:none;font-size: 14px">
                    </span>
                  </div>
                </div>
              </div>
              <div class="row lowerBlock" data-dojo-attach-point="lowerBlock">
                <div class="col-xs-12 col-sm-5 escoList__headerContainer"
                  data-dojo-attach-point="headerContainer">
                  <input type="text" class="form-control" data-dojo-attach-point="typeaheadInput" style="display:none; width: 150%"/>
                  <span data-dojo-attach-point="headerContainerInner">
                    <button type="button" class="btn btn-link expandButton"
                      data-dojo-attach-point="expandButton" style="display:none">
                      <span data-dojo-attach-point="expandButtonIcon"
                        class="fas fa-chevron-right" aria-hidden="true">
                      </span>
                    </button>
                    <span data-dojo-attach-point="listHeader"></span>
                  </span>
                </div>
                <div data-dojo-attach-point="resultSizeContainer" class="esco__resultSize"></div>
                <div class="col-xs-12 col-sm-6 pull-right escoList__sortBy" style="padding-right: 0px;">
                  <span style="display:none;" class="pull-right"
                    data-dojo-attach-point="sortBlock">
                    <span class="listSortLabel"
                      data-dojo-attach-point="sortOptionsLabel"></span>
                    <div class="btn-group " data-toggle="buttons">
                      <label class="btn btn-default"
                        data-dojo-attach-point="sortOrderTitleNode"
                      >
                        <input type="radio" name="${id}_listOrder" autocomplete="off" />
                        <span data-dojo-attach-point="sortOrderTitleCheck"></span>
                      </label>
                      <label class="btn btn-default active"
                        data-dojo-attach-point="sortOrderModNode">
                        <input type="radio" name="${id}_listOrder" autocomplete="off"
                          checked />
                        <span data-dojo-attach-point="sortOrderDateCheck"></span>
                      </label>
                    </div>
                  </span>
                </div>
                <div class="col-md-5 escoList__headerContainer escoList__lowerBlockContainer col-sm-7"
                  data-dojo-attach-point="lowerBlockContainer">
                  <div data-dojo-attach-point="massOperationsNode">
                    <div class="col-md-5 checkbox" style="padding: 0px; margin-bottom: 15px">
                      <label data-dojo-attach-point="selectAll">
                        <input type="checkbox" data-dojo-attach-point="selectallCheck" />
                        <span class="checkboxLabel" data-dojo-attach-point="selectallLabel"></span>
                      </label>
                    </div>
                    <div class="col-md-2">
                      <button type="button" class="btn btn-raised btn-link" data-dojo-attach-point="btnAll"
                        style="padding-top: 2px; color: black; display: none"
                        data-dojo-attach-event="onclick:removeAll">
                        <span class="fas fa-trash-alt" aria-hidden="true"></span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="entryList regular" data-dojo-attach-point="rowListNode">
              <div data-dojo-attach-point="tableHeading" class="rowTitle"></div>
            </div>
          </div>
          <div data-dojo-attach-point="__placeholder"
            class="" role="alert"></div>
          <div class="entryPagination small">
            <nav>
              <ul class="pagination" data-dojo-attach-point="paginationList">
                <li data-dojo-attach-point="paginationPreviousLi" class="disabled">
                  <a data-dojo-attach-point="paginationPreviousA"
                    data-dojo-attach-event="click:_clickPrevious">
                    <span aria-hidden="true">&laquo;</span>
                  </a>
                </li>
                <li data-dojo-attach-point="paginationNextLi">
                  <a data-dojo-attach-point="paginationNextA"
                    data-dojo-attach-event="click:_clickNext">
                    <span aria-hidden="true">&raquo;</span>
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          <div class="suggestions">
            <h1>Suggestions</h1>
            <div class="list">
              { state.suggestions.map(suggestion => (
                <Suggestion
                  entry={suggestion}
                />
              ))}
            </div>
          </div>

        </div>
      );
    },
  };
};
