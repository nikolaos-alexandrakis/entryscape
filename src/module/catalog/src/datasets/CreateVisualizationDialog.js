import { getUploadedDistributionEntries } from 'catalog/datasets/utils/datasetUtil';
import { getDistributionFileEntries } from 'catalog/datasets/utils/distributionUtil';
import { createVisualizationConfigurationEntry } from 'catalog/datasets/utils/visualizationUtil';
import escaVisualization from 'catalog/nls/escaVisualization.nls';
import TypeSelector from 'catalog/visualization/components/TypeSelector';
import VisualizationChart from 'catalog/visualization/components/VisualizationChart';
import TitleDialog from 'commons/dialog/TitleDialog';
import { getEntryRenderName } from 'commons/util/entryUtil';
import { createSetState } from 'commons/util/util';
import declare from 'dojo/_base/declare';
import Papa from 'papaparse';
import m from 'mithril';
import './CreateVisualizationDialog.scss';

let csvData;
const updateCSVData = (data) => {
  csvData = data;
  m.redraw();
};

// potentially put to the distributionHelper
const getCSVFiles = async (datasetEntry) => {
  const distEntries = await getUploadedDistributionEntries(datasetEntry, ['text/csv']);
  const csvFiles = [];
  const filesPromises = [];
  distEntries.forEach((distEntry) => {
    // get the file entries
    const fileEntriesPromise = getDistributionFileEntries(distEntry)
      .then((entries) => {
        entries.forEach((csvFileEntry) => {
          const uri = csvFileEntry.getResourceURI();
          const fileName = getEntryRenderName(csvFileEntry);
          const distributionName = getEntryRenderName(distEntry);

          csvFiles.push({
            uri,
            distributionName,
            fileName,
            distributionRURI: distEntry.getResourceURI(), // needed to link the distribution with the viz
          });
        });
      });

    filesPromises.push(fileEntriesPromise);
  });

  await Promise.all(filesPromises);
  return csvFiles;
};

const parseCSVFile = (uri, callback) => {
  Papa.parse(uri, {
    download: true,
    header: true,
    complete: callback,
  });
};

const state = {
  distributionFile: null,
  chartType: 'bar',
  operation: 'none',
  xAxisField: null,
  yAxisField: null,
};

const getControllerComponent = (datasetEntry, files) => {
  const setState = createSetState(state);

  const onChangeSelectedFile = (evt) => {
    const fileURI = evt.target.value;
    if (!state.distributionFile || (state.distributionFile.uri !== fileURI)) {
      const distributionFile = files.find(file => file.uri === fileURI);
      setState({
        distributionFile,
      });

      parseCSVFile(distributionFile.uri, updateCSVData); // should have a spinner loading
    }
  };


  return {
    view() {
      const hasData = state.distributionFile && csvData;
      return (<section class="viz__editDialog">
        <section class="viz__intro">
        </section>
        <section class="useFile">
          <h4>Distribution</h4>
          <div class="useFile__wrapper">
            <h5>You are using this file:</h5>
            <div class="form-group">
              <select className="form-control" onchange={onChangeSelectedFile}>
                {files.map(file => <option value={file.uri}>{file.distributionName} - {file.fileName}</option>)}
              </select>
            </div>
            </div>
          </section>
          <section class="graphType__wrapper">
            <h4>Type of visualization</h4>
            <p> Choose a type of visualization.Consider that not all data work fine with all representations</p>
            <TypeSelector
              type={state.chartType}
            />
          </section>

          <section class="axisOperation__wrapper">
            <div class="axisOptions">
              <h4>Axes to use</h4>
              <p>Select which data you want to show on each axis.</p>
              <p>On axis X you can select an operator to create more complicated visualizations.</p>
              <div class="axisOptions__wrapper">
                <div class="axisX__wrapper">
                  <h5>X:</h5>
                  <div class="form-group">
                    <select class="form-control">
                      {hasData ? csvData.meta.fields.map(field => <option value={field}>{field}</option>) : null}
                    </select>
                  </div>
                  <div class="form-group operations__wrapper">
                    <select class="form-control">
                      <option>SUM</option>
                      <option>COUNT</option>
                    </select>
                  </div>
                </div>
                <div class="axisY__wrapper">
                  <h5>Y:</h5>
                  <div class="form-group">
                    <select class="form-control">
                      {hasData ? csvData.meta.fields.map(field => <option value={field}>{field}</option>) : null}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="vizPreview__wrapper">
          <h4>Preview of dataset visualization</h4>

          <VisualizationChart
            type={state.chartType}
            data={csvData}
          />
        </section>
      </section>
      );
    },
  };
};

export default declare([TitleDialog.ContentComponent], {
  nlsBundles: [{ escaVisualization }],
  nlsHeaderTitle: 'vizDialogTitle',
  nlsFooterButtonLabel: 'vizDialogFooter',
  async open(params) {
    const { entry: datasetEntry } = params;
    this.entry = datasetEntry;

    const files = await getCSVFiles(datasetEntry);
    this.controllerComponent = getControllerComponent(datasetEntry, files);

    this.show(this.controllerComponent);
    this.dialog.show();
  },
  footerButtonAction() {
    const { distributionFile } = state;
    return createVisualizationConfigurationEntry(this.entry, distributionFile.distributionRURI, state)
      .then(console.log)
      .catch(console.log);
  },
});
