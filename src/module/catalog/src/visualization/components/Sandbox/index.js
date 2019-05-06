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
const loadDatasetsAndDistributions = async () => {
  const es = registry.getEntryStore();

  // get all distributions that have an uploaded(?) csv file
  distributionEntries = await es.newSolrQuery()
    .rdfType('dcat:Distribution')
    .literalProperty('dcterms:format', 'text/csv')
    .getEntries(0); // @todo gets only first page

  const distributionWithCsvFilesRURI = distributionEntries.map(distEntry => distEntry.getResourceURI());

  datasetEntries = await es.newSolrQuery()
    .rdfType('dcat:Dataset')
    .uriProperty('dcat:distribution', distributionWithCsvFilesRURI)
    .getEntries(0); // @todo gets only first page


  return [datasetEntries, distributionEntries];
};

export default () => {
  const state = {
    entry: null,
  };
  const setState = createSetState(state);

  const updateEntry = (e) => {
    const entryRURI = e.target.value;
    const entry = datasetEntries.find(datasetEntry => datasetEntry.getResourceURI() === entryRURI);
    setState({
      entry,
    });
  };

  return {
    oninit() {
      loadDatasetsAndDistributions().then(() => {
        const entry = datasetEntries.length > 0 ? datasetEntries[0] : null;
        setState({
          entry,
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
                    class="fa fa-plus"></span></button>
                </header>
                <div class="datasetSelector">
                  <select class="form-control" onchange={updateEntry}>
                    {datasetEntries.map(dataset => <option value={dataset.getResourceURI()}>{getEntryRenderName(dataset)}</option>)}
                  </select>
                  <button class="btn btn-secondary fas fa-times"></button>
                </div>

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

                <div>
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
                <div class="vizPlaceholder">
                  {/*                   <GraphPlaceholderAnimation/>
 */}                </div>
                {/*                 <img src="https://static.vaadin.com/directory/user35550/screenshot/file8494337878231358249_15061520778722017-09-2309_33_26-VaadinChart.jsAddon.png"></img>
 */}              </div>
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
};
