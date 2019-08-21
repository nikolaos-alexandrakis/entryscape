import escaPreparationsNLS from 'catalog/nls/escaPreparations.nls';
import SearchInput from 'commons/components/SearchInput';
import registry from 'commons/registry';
import { createSetState } from 'commons/util/util';
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
    datasets: [],
    linkedDatasets: [],
  };
  const setState = createSetState(state);

  /**
   *
   * @param searchToken
   * @return {Promise<void>}
   */
  const loadDatasets = async (searchToken = '') => {
    const query = registry.getEntryStore().newSolrQuery()
      .rdfType('dcat:Dataset')
      .context(registry.getContext()); // @todo is there a need to specify that they belong to a specific catalog?

    // If there's more than 3 characters than trigger a search
    if (typeof searchToken === 'string' && searchToken.length > 2) {
      query.title(searchToken);
    }

    const datasets = await query.getEntries();

    const linkedDatasetURIs = getDatasetsURILinkedWithSuggestion(entry);
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

  return {
    oncreate() {
      loadDatasets();
    },
    view(vnode) {
      const escaPreparations = i18n.getLocalization(escaPreparationsNLS);
      return <div className="preparationsDatasetList">
        <div className="row">
          <div className="listButtons col">
            <div className="row">
              <SearchInput
                onchangeSearch={loadDatasets}
                columnWidth="col"
                placeholder={'Search for datasets'}
              />
              <div className="col flex-row-reverse d-flex align-items-end">
                <button
                  type="button"
                  className="float-right btn btn-raised btn-secondary"
                  title="Reload list"
                  onclick={loadDatasets}
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
          <div className="mb-4">
            <h5 className="listHeading">Linked datasets</h5>
            <hr/>
            {state.linkedDatasets.length ? state.linkedDatasets.map(dataset =>
                <DatasetRow key={dataset.getId()} entry={dataset} isLinked={true} onclick={unlink}/>)
              : <ListPlaceholder label={escaPreparations.linkDatasetEmptyList}/>
            }
          </div>
          <div className="mb-4">
            <h5 className="listHeading">Datasets in catalog</h5>
            <hr/>
            {state.datasets.length ? <div>{state.datasets.map(dataset =>
              <DatasetRow key={dataset.getId()} entry={dataset} onclick={link}/>)}
            </div> : <ListPlaceholder label={escaPreparations.linkDatasetEmptyList}/>}
          </div>
        </div>
      </div>;
    },
  };
};
