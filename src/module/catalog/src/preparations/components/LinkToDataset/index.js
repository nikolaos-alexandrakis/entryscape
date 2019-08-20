import SearchInput from 'commons/components/SearchInput';
import registry from 'commons/registry';
import { createSetState } from 'commons/util/util';
import DatasetRow from '../DatasetRow';
import actions from './actions';

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
    datasets: [],
    linkedDatasets: [],
  };
  const setState = createSetState(state);

  /**
   * Retrieves datasets entries in context and sets the state
   *
   * @return {Promise<void>}
   */
  const loadDatasets = async (refreshedEntry = null, searchToken = '') => {
    const context = registry.getContext();

    const query = registry.getEntryStore().newSolrQuery()
      .rdfType('dcat:Dataset')
      .context(context); // @todo is there a need to specify that they belong to a specific catalog?
    if (searchToken && searchToken.length > 2) {
      query.title(searchToken);
    }
    const datasets = await query.getEntries();

    const linkedDatasetURIs = getDatasetsURILinkedWithSuggestion(refreshedEntry || entry);
    const linkedDatasetEntries = datasets.filter(dataset => linkedDatasetURIs.includes(dataset.getResourceURI()));
    const datasetEntries = datasets.filter(dataset => !linkedDatasetURIs.includes(dataset.getResourceURI()));

    setState({
      datasets: datasetEntries,
      linkedDatasets: linkedDatasetEntries,
    });
  };

  const bindActions = actions(entry);

  /**
   * @param {string} datasetRURI
   * @return {*}
   */
  const unlink = datasetRURI => bindActions.unlink(datasetRURI).then(loadDatasets);

  /**
   * @param {string} datasetRURI
   * @return {*}
   */
  const link = datasetRURI => bindActions.link(datasetRURI).then(loadDatasets);

  const search = token => loadDatasets(null, token);

  return {
    oncreate() {
      loadDatasets();
    },
    view(vnode) {
      return <div className="preparationsOverview entryList searchVisible">
        <div className="row mb-3">
          <div className="listButtons row col">
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
              >
                <span aria-hidden="true" className="fas fa-sync"/>
                <span className="escoList__buttonLabel"/>
              </button>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div className="alert alert-primary" role="alert">
              <i className="fas fa-info-circle"/>
              A simple primary alert—check it out!
            </div>
          </div>
        </div>
        <div className="list mb-3">
          <div className="mb-4">
            <h2>Linked datasets</h2>
            {state.linkedDatasets.map(dataset =>
              <DatasetRow key={dataset.getId()} entry={dataset} isLinked={true} onclick={unlink}/>)}
          </div>
          <h2>Datasets in catalog</h2>
          <div>{state.datasets.map(dataset => <DatasetRow key={dataset.getId()} entry={dataset} onclick={link}/>)}</div>
        </div>
      </div>;
    },
  };
};
