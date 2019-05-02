import { getUploadedDistributionEntries } from 'catalog/datasets/utils/datasetUtil';
import { getDistributionFileEntries } from 'catalog/datasets/utils/distributionUtil';
import escaVisualization from 'catalog/nls/escaVisualization.nls';
import TitleDialog from 'commons/dialog/TitleDialog';
import VisualizationChart from 'catalog/visualization/components/VisualizationChart';
import { getEntryRenderName } from 'commons/util/entryUtil';
import { createSetState } from 'commons/util/util';
import declare from 'dojo/_base/declare';
import Papa from 'papaparse';
import './CreateVisualizationDialog.scss';

let csvData;
const updateCSVData = (data) => {
  csvData = data;
};

const parseCSVFile = (uri, callback) => {
  Papa.parse(uri, {
    download: true,
    header: true,
    complete: callback,
  });
};

const getCSVFiles = async (datasetEntry) => {
  const distEntries = await getUploadedDistributionEntries(datasetEntry, ['text/csv']);
  const csvFilePromises = distEntries.map(getDistributionFileEntries);
  const datasetName = getEntryRenderName(datasetEntry);

  // get distribution names if exists
  const files = [];
  for await (const csvFileEntries of csvFilePromises) { // eslint-disable-line
    csvFileEntries.forEach((csvFileEntry) => {
      const uri = csvFileEntry.getResourceURI();
      const fileName = getEntryRenderName(csvFileEntry);

      files.push({
        uri,
        datasetName,
        fileName,
      });
    });
  }

  return files;
};

const getControllerComponent = (datasetEntry) => {
  const state = {
    files: [],
    distributionFile: null,
    chartType: 'map',
    operation: 'none',
    xAxisField: null,
    yAxisField: null,
  };

  const setState = createSetState(state);

  const onChangeSelectedFile = (evt) => {
    const fileIdx = evt.target.value;
    if (state.selectedFileIdx !== fileIdx) {
      setState({
        selectedFileIdx: fileIdx,
      });

      parseCSVFile(state.files[fileIdx].uri, updateCSVData); // should have a spinner loading
    }
  };


  return {
    oninit() {
      getCSVFiles(datasetEntry).then((files) => {
        setState({
          files,
        });
      });
    },
    view() {
      const selectedFile = state.files[state.selectedFileIdx];
      const hasData = selectedFile && csvData;

      return (<section class="viz__editDialog">
        <section class="viz__intro">
        </section>
        <section class="useFile">
          <h4>Distribution</h4>
          <div class="useFile__wrapper">
            <h5>You are using this file:</h5>
            <div class="form-group">
              <select class="form-control" onchange={onChangeSelectedFile}>
                {state.files.map((file, idx) => <option value={idx}
                  onclick={onChangeSelectedFile.bind(null, idx)}>{file.datasetName} - {file.fileName}</option>)}
              </select>
            </div>
          </div>
        </section>
        <section class="graphType__wrapper">
          <h4>Type of visualization</h4>
          <p> Choose a type of visualization.Consider that not all data work fine with all representations</p>
          <div class="graphType__card__wrapper">
            <div class="btn-group btn-group-toggle" data-toggle="buttons">
              <label class="btn btn-secondary btn-raised active">
                <input type="radio" name="options" id="option1" autocomplete="off" 
                  checked={state.chartType === 'map'}
                ></input>Map
              </label>
              <label class="btn btn-secondary btn-raised">
                <input type="radio" name="options" id="option2" autocomplete="off"
                  checked={state.chartType === 'bar'}
                ></input>Bar Chart
              </label>
              <label class="btn btn-secondary btn-raised">
                <input type="radio" name="options" id="option3" autocomplete="off"
                  checked={state.chartType === 'line'}
                ></input>Line Chart
              </label>
            </div>
          </div>
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
                    <option>Name of default distribution</option>
                    <option>Name of other distribution</option>
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
                    <option>Name of default distribution</option>
                    <option>Name of other distribution</option>
                  </select>
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
  open(params) {
    const { entry: datasetEntry } = params;
    this.dialog.show();
    const controllerComponent = getControllerComponent(datasetEntry);
    this.show(controllerComponent);
  },
  footerButtonAction(params) {
  },
});
