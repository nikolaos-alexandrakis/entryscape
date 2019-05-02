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
    chartType: 'map',
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
          <h3>Here you can choose the type of data visualization you want to use and in which axis is rendered</h3>
        </section>
        <section class="userFile">
          <h4>Choose a distribution</h4>
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
          <h4>Choose a type of visualization</h4>
          <p>Consider that not all data work fine with all representations</p>
          <div class="graphType__card__wrapper">
            <div class="graphType__card">
              <p class="__title">Map</p>
            </div>
            <div class="graphType__card">
              <p class="__title">Pie Chart</p>
            </div>
            <div class="graphType__card">
              <p class="__title">Bar Chart</p>
            </div>
            <div class="graphType__card">
              <p class="__title">Line Chart</p>
            </div>
          </div>
        </section>
        <section class="axisOperation__wrapper">
          <div class="operations">
            <h4>Choose a type of operation</h4>
            <p>You can select for example all the rows with the same date</p>
            <div class="dropdown__wrapper">
              <div class="form-group">
                <select class="form-control">
                  <option>SUM</option>
                  <option>COUNT</option>
                </select>
              </div>
            </div>
          </div>
          <div class="axisOptions">
            <h4>Axes to use</h4>
            <div class="axisOptions__wrapper">
              <div class="axisX__wrapper">
                <h5>X:</h5>
                <div class="form-group">
                  <select class="form-control">
                    <option>Name of default distribution</option>
                    <option>Name of other distribution</option>
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
