import escaVisualizationNLS from 'catalog/nls/escaVisualization.nls';
import AxisSelector from 'catalog/visualization/components/AxisSelector';
import TypeSelector from 'catalog/visualization/components/TypeSelector';
import VisualizationChart from 'catalog/visualization/components/VisualizationChart';
import registry from 'commons/registry';
import { getEntryRenderName } from 'commons/util/entryUtil';
import { createSetState } from 'commons/util/util';
import { i18n } from 'esi18n';
import './index.scss';

let datasetEntries = [];
let distributionEntries = [];
let distributionWithCsvFilesRURI = [];
const loadDatasetsAndDistributions = async () => {
  const es = registry.getEntryStore();

  // get all distributions that have an uploaded(?) csv file
  distributionEntries = await es.newSolrQuery()
    .rdfType('dcat:Distribution')
    .literalProperty('dcterms:format', 'text/csv')
    .getEntries(0); // @todo gets only first page

  distributionWithCsvFilesRURI = distributionEntries.map(distEntry => distEntry.getResourceURI());

  datasetEntries = await es.newSolrQuery()
    .rdfType('dcat:Dataset')
    .uriProperty('dcat:distribution', distributionWithCsvFilesRURI)
    .getEntries(0); // @todo gets only first page


  return [datasetEntries, distributionEntries];
};

const getFirstCSVDistributionFromDataset = (dataset) => {
  const stmts = dataset.getMetadata().find(dataset.getResourceURI(), 'dcat:distribution');
  const distributionEntryStmt = stmts.find(stmt => distributionWithCsvFilesRURI.some(ruri => ruri === stmt.getValue()));
  const distRURI = distributionEntryStmt.getValue();
  return distributionEntries.find(distEntry => distEntry.getResourceURI() === distRURI);
};

const getFirstCSVFileFromDistribution = distribution => distribution.getMetadata()
  .findFirstValue(distribution.getResourceURI(), 'dcat:downloadURL');

export default () => {
  const state = {
    datasets: [{
      // datasetEntry: null,
      // distributionEntry: null,
      // csvURI: null,
    }],
  };
  const setState = createSetState(state);

  const addDataset = () => {
    const datasets = state.datasets;
    datasets.push({
      datasetEntry: null,
      distributionEntry: null,
      csvURI: null,
    });

    setState({
      datasets,
    });
  };

  const updateEntries = (selectedIdx, e) => {
    const entryRURI = e.target.value;
    const datasetEntry = datasetEntries.find(entry => entry.getResourceURI() === entryRURI);
    const distributionEntry = getFirstCSVDistributionFromDataset(datasetEntry);
    const csvURI = getFirstCSVFileFromDistribution(distributionEntry);

    const datasets = state.datasets;
    datasets[selectedIdx] = {
      datasetEntry,
      distributionEntry,
      csvURI,
    };

    setState({
      datasets,
    });
  };

  return {
    oninit() {
      loadDatasetsAndDistributions().then(() => {
        const datasetEntry = datasetEntries.length > 0 ? datasetEntries[0] : null;
        const distributionEntry = getFirstCSVDistributionFromDataset(datasetEntry);
        const csvURI = getFirstCSVFileFromDistribution(distributionEntry);
        setState({
          datasetEntry,
          distributionEntry,
          csvURI,
        });
      });
    },
    view(vnode) {
      const escaVisualization = i18n.getLocalization(escaVisualizationNLS);


      return (
        <div className='visualizations__sandbox'>
          <h3>{escaVisualization.vizSandboxTitle}</h3>
          <div class="viz__wrapper">

            <div class="vizOptions__wrapper">
              <section class="datasets__wrapper">
                <header>
                  <h4>{escaVisualization.vizSandboxDatasetTitle}</h4>
                  <button alt="Add dataset" class="btn btn-primary btn--add btn-fab btn-raised"><span
                    class="fa fa-plus" onclick={addDataset}></span></button>
                </header>
                {state.datasets.map((datasetSelect, idx) => {
                  const distributionName = datasetSelect.distributionEntry ? getEntryRenderName(datasetSelect.distributionEntry) : '';
                  return <div className="datasetSelector">
                  <div>
                   <select className="form-control" onchange={updateEntries.bind(null, idx)}>
                      {datasetEntries.map(dataset => <option
                          value={dataset.getResourceURI()}>{getEntryRenderName(dataset)}</option>)}
                    </select>
                    <button className="btn btn-secondary fas fa-times"></button>
                  </div>
                    

                    <div class="dataset__metadata">
                      <label>{datasetSelect.distributionName ? `${escaVisualization.vizSandboxDatasetDistribution} ${distributionName}` : ''}</label>
                      <a href={datasetSelect.csvURI} target='_blank'>csv file</a>
                    </div>
                  </div>;
                })}


              </section>

              <section class="vizTypes__wrapper">
                <header>
                  <h4>{escaVisualization.vizSandboxTypeTitle}</h4>
                </header>
                <TypeSelector
                  type={state.chartType}
                />
              </section>

              <section class="axesOperations__wrapper">
                <header>
                  <h4>{escaVisualization.vizSandboxAxesTitle}</h4>
                </header>

                <div class="axesDataset__wrapper">
                  <label>Dataset *datasetName*</label>
                  <AxisSelector></AxisSelector>
                </div>
                <div class="axesDataset__wrapper">
                  <label>Dataset *datasetName*</label>
                  <AxisSelector></AxisSelector>
                </div>
              </section>
            </div>

            <section class="vizGraph__wrapper">
              <div>
                <VisualizationChart
                  type={state.chartType}
                  xAxisField={state.xAxisField}
                  yAxisField={state.yAxisField}
                  operation={state.operation}
                  data={null}/>
                <div class="no-data">{escaVisualization.vizNoData}</div>

              </div>
            </section>

          </div>
          <section class="vizNotes__wrapper">
            <div class="vizNotes__errors">
              <p></p>

            </div>
            <div class="vizNotes__help">
              <p>{escaVisualization.vizSandboxHelpDataset}</p>
              <p>{escaVisualization.vizSandboxHelpType}</p>
              <p>{escaVisualization.vizSandboxHelpAxes}</p>
            </div>
          </section>
        </div>
      );
    },
  };
}
;
