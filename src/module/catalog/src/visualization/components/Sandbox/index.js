import { detectTypes, parseCSVFile } from 'catalog/datasets/utils/visualizationUtil';
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

const csvData = new Map();
const csvDetectedTypes = new Map(); // map of maps
const updateCsvData = (csvUri, data) => {
  csvData.set(csvUri, data);
  const detectedTypes = detectTypes(data);
  csvDetectedTypes.set(csvUri, detectedTypes);
  m.redraw();
};

const getCsvDataFields = (datasetRURI) => {
  if (datasetRURI && csvData.has(datasetRURI)) {
    return csvData.get(datasetRURI).meta.fields;
  }

  return [];
};

const loadDatasetsAndDistributions = async (context) => {
  const es = registry.getEntryStore();

  // get all distributions that have an uploaded(?) csv file
  const query =  es.newSolrQuery()
    .rdfType('dcat:Distribution')
    .literalProperty('dcterms:format', 'text/csv');

  if (context) {
    query.context(context);
  }
  distributionEntries = await query.getEntries(0); // @todo gets only first page

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
    chartType: 'bar',
    datasets: [{
      datasetEntry: null,
      distributionEntry: null,
      csvURI: null,
      xAxisField: null,
      yAxisField: null,
      operation: null,
    }],
  };
  const setState = createSetState(state);

  const getDefaultDatasetURI = () => {
    const datasetEntry = datasetEntries.length > 0 ? datasetEntries[0] : null; // just select the first
    return datasetEntry.getResourceURI();
  };

  const getDatasetInfo = (entryRURI) => {
    const datasetEntry = datasetEntries.find(entry => entry.getResourceURI() === entryRURI);
    const distributionEntry = getFirstCSVDistributionFromDataset(datasetEntry);
    const csvURI = getFirstCSVFileFromDistribution(distributionEntry);

    return { datasetEntry, distributionEntry, csvURI };
  };

  const updateEntry = (selectedIdx, entryRURI) => {
    const data = getDatasetInfo(entryRURI);

    const datasets = state.datasets;
    datasets[selectedIdx] = data;

    setState({
      datasets,
    });

    if (!csvData.has(data.csvURI)) {
      parseCSVFile(data.csvURI)
        .then(csvParsedData => updateCsvData(data.csvURI, csvParsedData));
    }
  };

  const onTypeChange = (type) => {
    setState({ chartType: type });
    // setSensibleDefaults(type);
  };

  const onchangeEntry = (selectedIdx, e) => {
    const entryRURI = e.target.value;
    updateEntry(selectedIdx, entryRURI);
  };

  const onAxisUpdate = (selectedIdx, fields) => {
    const datasets = state.datasets;
    datasets[selectedIdx].xAxisField = fields.x;
    datasets[selectedIdx].yAxisField = fields.y;
    datasets[selectedIdx].operation = fields.operation;

    setState({
      datasets,
    });
  };

  const addDataset = () => {
    const datasets = state.datasets;
    datasets.push({
      datasetEntry: null,
      distributionEntry: null,
      csvURI: '',
    });

    setState({
      datasets,
    });
    const defaultDatasetURI = getDefaultDatasetURI();
    updateEntry(datasets.length - 1, defaultDatasetURI); // just selects a default for the new
  };

  return {
    oninit(vnode) {
      loadDatasetsAndDistributions(vnode.attrs.context)
        .then(() => {
          const defaultDatasetURI = getDefaultDatasetURI();
          updateEntry(0, defaultDatasetURI);
        });
    },
    view(vnode) {
      const escaVisualization = i18n.getLocalization(escaVisualizationNLS);
      const data = state.datasets.map(dataset => {
        const datasetEntry = dataset.datasetEntry;
        return {
          xField: dataset.xAxisField,
          yField: dataset.yAxisField,
          operation: dataset.operation,
          csv: csvData.get(dataset.csvURI),
          label: datasetEntry ? `${getEntryRenderName(datasetEntry)} - ${dataset.xAxisField}` : '',
        };
      });
      console.log(data);
      return (
        <div className='visualizations__sandbox'>
          <h3>{escaVisualization.vizSandboxTitle}</h3>
          <div class="viz__wrapper">

            <div class="vizOptions__wrapper">
              <section class="vizTypes__wrapper">
                <header>
                  <h4>{escaVisualization.vizSandboxTypeTitle}</h4>
                </header>
                <TypeSelector
                  type={state.chartType}
                  onSelect={onTypeChange}
                />
              </section>
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
                      <select className="form-control" onchange={onchangeEntry.bind(null, idx)}>
                        {datasetEntries.map(dataset => <option
                          value={dataset.getResourceURI()}>{getEntryRenderName(dataset)}</option>)}
                      </select>
                      <button className="btn btn-secondary"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="dataset__metadata">
                      <a href={datasetSelect.csvURI}
                         target='_blank'>{distributionName ? `${escaVisualization.vizSandboxDatasetDistribution} ${distributionName}` : 'CSV'}</a>
                    </div>
                  </div>;
                })}


              </section>

              <section class="axesOperations__wrapper">
                <header>
                  <h4>{escaVisualization.vizSandboxAxesTitle}</h4>
                </header>
                {state.datasets.map((dataset, idx) => {
                  return <div>
                    {dataset.datasetEntry ?
                      <label>{escaVisualization.vizSandboxDatasetLabel} {getEntryRenderName(dataset.datasetEntry)}</label> : null}
                    <AxisSelector
                      x={dataset.xAxisField}
                      y={dataset.yAxisField}
                      operation={dataset.operation}
                      fields={getCsvDataFields(dataset.csvURI)}
                      type={state.chartType}
                      onSelect={onAxisUpdate.bind(null, idx)}
                    />
                  </div>;
                })}
              </section>
            </div>

            <section class="vizGraph__wrapper">
              <div>
                {data.every(dataset => dataset.xField) ? <VisualizationChart
                  type={state.chartType}
                  data={data}/> : <div className="no-data">{escaVisualization.vizNotReady}</div>
                }
              </div>
            </section>

          </div>
        </div>
      );
    },
  };
}
;
