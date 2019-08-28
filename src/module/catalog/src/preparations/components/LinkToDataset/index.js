import escaPreparationsNLS from 'catalog/nls/escaPreparations.nls';
import Pagination from 'commons/components/common/Pagination';
import { paginationHandler } from 'commons/components/common/Pagination/util';
import SearchInput from 'commons/components/SearchInput';
import registry from 'commons/registry';
import { createSetState, LIST_PAGE_SIZE_SMALL } from 'commons/util/util';
import { i18n } from 'esi18n';
import DatasetRow from '../DatasetRow';
import ListPlaceholder from '../ListPlaceholder';
import actions from './actions';
import './index.scss';

/**
 *
 * @param entry
 */
const getDatasetsURILinkedWithSuggestion = (entry) => {
  const stmts = entry.getMetadata().find(entry.getResourceURI(), 'dcterms:references');
  return stmts.map(stmt => stmt.getValue());
};

export default (initialVnode) => {
  const { entry } = initialVnode.attrs;
  const state = {
    // not linked datasets
    datasets: [],
    datasetsResultSize: null,
    datasetsCurrentPage: 0,

    // linked datasets
    linkedDatasets: [],
    linkedDatasetsResultSize: null,
    linkedDatasetsCurrentPage: 0,

    searchToken: null,
  };

  const setState = createSetState(state);

  /**
   * @return {store|SolrQuery}
   */
  const getSolrQuery = () => {
    const query = registry.getEntryStore().newSolrQuery()
      .rdfType('dcat:Dataset')
      .context(registry.getContext()) // @todo is there a need to specify that they belong to a specific catalog?
      .limit(LIST_PAGE_SIZE_SMALL);

    // If there's more than 3 characters than trigger a search
    if (typeof state.searchToken === 'string' && state.searchToken.length > 2) {
   query.title(state.searchToken);
    }

    return query;
  };

  /**
   * Synchronously fetches a result set (@see store/SearchList) for two store/SolrQuery,
   * one for datasets that referenced from the current entry and one for all the rest datasets in context that are not.
   *
   * If a search token is provided, that is also added to the query
   *
   * @return {Promise<void>}
   */
  const loadDatasets = async () => {
    let linkedDatasetSearchList = null;
    let datasetSearchList = getSolrQuery().list();

    const linkedDatasetURIs = getDatasetsURILinkedWithSuggestion(entry);

    if (linkedDatasetURIs.length !== 0) {
      // linked datasets
      linkedDatasetSearchList = getSolrQuery().resource(linkedDatasetURIs, false).list();
      datasetSearchList = getSolrQuery().resource(linkedDatasetURIs, true).list();
    }

    const linkedDatasets = await (linkedDatasetSearchList ?
      linkedDatasetSearchList.getEntries(state.linkedDatasetsCurrentPage) : []);
    const linkedDatasetsSearchSize = linkedDatasetSearchList ? linkedDatasetSearchList.getSize() : 0;

    const datasets = await datasetSearchList.getEntries(state.datasetsCurrentPage);
    const datasetsSearchSize = datasetSearchList.getSize();

    setState({
      datasets,
      datasetsSearchSize,
      linkedDatasets,
      linkedDatasetsSearchSize,
    });
  };

  /**
   *
   * @param {string} page
   * @param listName datasets|linkedDatasets
   * @return {Promise<void>} returns loadDatasets()
   */
  const paginateList = (page, listName) => paginationHandler(page, `${listName}CurrentPage`, setState, loadDatasets);

  /**
   * Clear the current search value
   */
  const resetSearchField = () => {
    // keep the state of the dom at the dom and not in mithril
    const el = initialVnode.dom.querySelector('input');
    el.value = '';

    setState({
      searchToken: null,
    });
  };

  /**
   * Reset list pages
   */
  const resetPagination = () => {
    setState({
      datasetsCurrentPage: 0,
      linkedDatasetsCurrentPage: 0,
    });
  };

  /**
   * Resets (the values of) the main components of the view, e.g pagination, search, etc..
   *
   * Returns a promise for convenience.
   *
   * @return {Promise<boolean>}
   */
  const reset = () => {
    resetPagination();
    resetSearchField();
    return Promise.resolve(true);
  };

  const bindActions = actions(entry);

  /**
   * @param {string} datasetRURI
   * @return {*}
   */
  const unlink = datasetRURI => bindActions.unlink(datasetRURI)
    .then(reset)
    .then(loadDatasets);


  /**
   * @param {string} datasetRURI
   * @return {*}
   */
  const link = datasetRURI => bindActions.link(datasetRURI)
    .then(reset)
    .then(loadDatasets);

  /**
   * @return {Promise<void>}
   */
  const reload = () => reset().then(loadDatasets);

  /**
   *
   * @param searchToken
   * @return {Promise<void>}
   */
  const search = (searchToken) => {
    resetPagination();
    setState({
      searchToken,
    });
    return loadDatasets();
  };

  return {
    oncreate: loadDatasets,
    view() {
      const escaPreparations = i18n.getLocalization(escaPreparationsNLS);
      const listNames = ['linkedDatasets', 'datasets'];

      const lists = listNames.map((listName) => {
        let list = null;
        if (state[listName].length) {
          const onclick = listName === 'datasets' ? link : unlink;
          const isLinked = listName === 'linkedDatasets';
          list = state[listName].map(dataset => <DatasetRow
            key={dataset.getId()}
            entry={dataset}
            isLinked={isLinked}
            onclick={onclick}/>);
        } else {
          list = <ListPlaceholder label={escaPreparations.linkDatasetEmptyList}/>;
        }

        let pagination = null;
        if (state[`${listName}SearchSize`] && state[`${listName}SearchSize`] > LIST_PAGE_SIZE_SMALL) {
          pagination = <Pagination
            currentPage={state[`${listName}CurrentPage`]}
            totalCount={state[`${listName}SearchSize`]}
            pageSize={LIST_PAGE_SIZE_SMALL}
            handleChangePage={newPage => paginateList(newPage, listName)}
          />;
        }

        const listHeading = escaPreparations[`${listName}ListHeading`];
        return { listHeading, list, pagination };
      });

      return <div className="preparationsDatasetList">
        <div className="row">
          <div className="listButtons col">
            <div className="row">
              <SearchInput
                onchangeSearch={search}
                columnWidth="col"
                placeholder={'Search for datasets'}
              />
              <div className="col flex-row-reverse d-flex align-items-end">
                <button
                  type="button"
                  className="float-right btn btn-raised btn-secondary"
                  title="Reload list"
                  onclick={reload}
                >
                  <span aria-hidden="true" className="fas fa-sync"/>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <div className="alert alert-info alert-dismissible fade show" role="alert">
              <i className="fas fa-info-circle mr-1"/>
              {escaPreparations.linkDatasetInfo}
              <button type="button" className="close" style="font-size: 1rem;" data-dismiss="alert" aria-label="Close">
                <i aria-hidden="true" className="fas fa-times"/>
              </button>
            </div>
          </div>
        </div>
        <div className="lists">
          {lists.map(({ listHeading, list, pagination }) => <div className="mb-4">
            <h5 className="listHeading">{listHeading}</h5>
            <hr/>
            {list}
            {pagination}
          </div>)}
        </div>
      </div>;
    },
  };
};
