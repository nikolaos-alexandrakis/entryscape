import { getUploadedDistributionEntries } from 'catalog/datasets/utils/datasetUtil';
import { getDistributionFileEntries } from 'catalog/datasets/utils/distributionUtil';
import { createVisualizationConfigurationEntry } from 'catalog/datasets/utils/visualizationUtil';
import escaVisualization from 'catalog/nls/escaVisualization.nls';
import VisualizationChart from 'catalog/visualization/components/VisualizationChart';
import TitleDialog from 'commons/dialog/TitleDialog';
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
  // const distEntriesNames = [];
  // const csvFilePromises = [];
  const files = [];
  const filesPromises = [];
  distEntries.forEach((distEntry) => {
    // get the file entries
    const fileEntriesPromise = getDistributionFileEntries(distEntry)
      .then((entries) => {
        entries.forEach((csvFileEntry) => {
          const uri = csvFileEntry.getResourceURI();
          const fileName = getEntryRenderName(csvFileEntry);
          const distributionName = getEntryRenderName(distEntry);

          files.push({
            uri,
            distributionName,
            fileName,
            distributionRURI: distEntry.getResourceURI(), // needed to link the distribution with the viz
          });
        });
      });

    filesPromises.push(fileEntriesPromise);
  });

  const a = await Promise.all(filesPromises);
  console.log(a);
  console.log(files);
  return files;
};

const state = {
  files: [],
  chartType: 'map',
};

const getControllerComponent = (datasetEntry) => {
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
    view(vnode) {
      this.state = state; // needed to get access from the dialog component
      const selectedFile = state.files[state.selectedFileIdx];
      const hasData = selectedFile && csvData;

      return (
        <section class="viz__editDialog">
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
                                                          onclick={onChangeSelectedFile.bind(null, idx)}>{file.distributionName} - {file.fileName}</option>)}
                </select>
              </div>
              <div class="useFile__btn__wrapper">
                <button type="button" class="btn btn-primary btn-raised btn-sm" id="load"
                        data-loading-text="<i class='fa fa-spinner fa-spin '></i> Adding new distribution">Change
                  distribution
                </button>
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
    this.entry = datasetEntry;

    this.dialog.show();
    this.controllerComponent = getControllerComponent(datasetEntry);
    this.show(this.controllerComponent);
  },
  footerButtonAction() {
    createVisualizationConfigurationEntry(this.entry, distURI, state);
  },
});
