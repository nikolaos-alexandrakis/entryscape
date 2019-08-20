import SearchInput from "commons/components/SearchInput";
import registry from 'commons/registry';
import { createSetState } from 'commons/util/util';

import DatasetRow from '../DatasetRow';
// import './index.scss';

/**
 *
 * @param entry
 */
const getDatasetsLinkedWithSuggestion = (entry) => {
  const stmts = entry.getMetadata().find(entry.getResourceURI(), 'dcterms:references');
  stmts.map(stmt => stmt.getValue());
};

export default (initialVnode) => {
  const { entry } = initialVnode.attrs;
  const state = {
    datasets: [],
    linkedDatasets: [],
  };
  const setState = createSetState(state);
  const loadDatasets = async () => {
    const context = registry.getContext();
    const datasets = await registry.getEntryStore().newSolrQuery()
      .rdfType('dcat:Dataset')
      .context(context)
      .getEntries();

    // const linkedDatasets = getDatasetsLinkedWithSuggestion(entry);

    setState({
      datasets,
      linkedDatasets: [],
    });
  };

  return {
    oncreate: loadDatasets,
    view(vnode) {
      return <div className="preparationsOverview entryList searchVisible">
        <div className="row mb-3">
          <div className="listButtons row col">
            <SearchInput
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


        <div className="list mb-3">
          {state.datasets.map(dataset => <DatasetRow entry={dataset}/>)}
        </div>
      </div>;
    },
  };
};
