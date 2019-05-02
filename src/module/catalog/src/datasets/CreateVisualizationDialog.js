import { getUploadedDistributionEntries } from 'catalog/datasets/utils/datasetUtil';
import { getDistributionFileEntries } from 'catalog/datasets/utils/distributionUtil';
import escaVisualization from 'catalog/nls/escaVisualization.nls';
import TitleDialog from 'commons/dialog/TitleDialog';
import GeoMap from 'commons/rdforms/choosers/components/Map';
import { getEntryRenderName } from 'commons/util/entryUtil';
import { createSetState } from 'commons/util/util';
import declare from 'dojo/_base/declare';
import Papa from 'papaparse';
import './CreateVisualizationDialog.scss';

const parseCSVFile = (info, callback) => {
  const complete = data => callback({ info, data });
  Papa.parse(info.uri, {
    download: true,
    header: true,
    complete,
  });
};

const getCSVFiles = async (datasetEntry, callback) => {
  const distEntries = await getUploadedDistributionEntries(datasetEntry, ['text/csv']);
  const csvFilePromises = distEntries.map(getDistributionFileEntries);

  for await (const csvFileEntries of csvFilePromises) { // eslint-disable-line
    csvFileEntries.forEach((csvFileEntry) => {
      const csvFileRURI = csvFileEntry.getResourceURI();
      const fileName = getEntryRenderName(csvFileEntry);
      console.log(fileName);
      parseCSVFile({
        uri: csvFileRURI,
        datasetName: 'dataset 1',
        fileName,
      }, callback);
    });
  }
};

const getControllerComponent = (datasetEntry) => {
  const state = {
    files: [],
  };

  const setState = createSetState(state);

  const updateCSVData = ({ info, data }) => {
    const { uri, datasetName, fileName } = info;
    const files = state.files;

    files.push({
      uri,
      datasetName,
      fileName,
      headers: data.meta.fields,
    });

    setState({ files });
  };

  const renderChart = (chartType) => {
    const chartMap = new Map(Object.entries({
      map: (
        <GeoMap
          value={[
            'POINT(30 10)',
            'POINT(31 10)',
          ]}
        />
      ),
      bar: (
        <img
          src='https://i0.wp.com/m.signalvnoise.com/wp-content/uploads/2016/11/1Eq40iwcboRFBMF37oAaM7Q.png?zoom=1.25&resize=637%2C411&ssl=1'>
        </img>
      ),
    }));

    return (
      <div class="map">
        {chartMap.get(chartType)}
      </div>
    );
  };

  return {
    oninit() {
      setState({
        files: [],
        chartType: 'map', // Can be map, pie, bar, line
      });
      getCSVFiles(datasetEntry, updateCSVData); // promise callbacked
    },
    view() {
      return (
        <section class="viz__editDialog">
        <section class="viz__intro">
          <h3>Here you can choose the type of data visualization you want to use and in which axis is rendered</h3>
        </section>
        <ul>
          {state.files.map(file => <li>
            <span>Dataset name : {file.datasetName}</span>
            <span>File name : {file.fileName}</span>
            <span>Headers : {file.headers.join()}</span>
          </li>)}
        </ul>
        <section class="userFile">
          <h4>Choose a distribution</h4>
          <div class="useFile__wrapper">
            <h5>You are using this file:</h5>
            <div class="dropdown">
              <button class="btn btn-default btn-sm dropdown-toggle" type="button" id="dropdownMenu1"
                      data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                Name of distribution file
                <span class="caret"></span>
              </button>
              <ul class="dropdown-menu" aria-labelledby="dropdownMenu">
                <li key="default-chooser" class="dropdown-header">Choose a distribution</li>
                {state.files.map(file => <li>{file.datasetName} - {file.fileName}</li>)}
              </ul>
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
              <div class="dropdown">
                <button class="btn btn-default btn-sm dropdown-toggle" type="button" id="dropdownMenu1"
                        data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                  Sum
                  <span class="caret"></span>
                </button>
                <ul class="dropdown-menu" aria-labelledby="dropdownMenu">
                  <li class="dropdown-header">Choose a column label</li>
                  <li><a href="#">Name of default file</a></li>
                  <li><a href="#">Another distribution</a></li>
                </ul>
              </div>
              <div class="dropdown">
                <button class="btn btn-default btn-sm dropdown-toggle" type="button" id="dropdownMenu1"
                        data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                  Column
                  <span class="caret"></span>
                </button>
                <ul class="dropdown-menu" aria-labelledby="dropdownMenu">
                  <li class="dropdown-header">Choose a column label</li>
                  <li><a href="#">Name of default file</a></li>
                  <li><a href="#">Another distribution</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div class="axisOptions">
            <h4>Axes to use</h4>
            <div class="axisOptions__wrapper">
              <div class="axisX__wrapper">
                <h5>X:</h5>
                <div class="dropdown">
                  <button class="btn btn-default btn-sm dropdown-toggle" type="button" id="dropdownMenu1"
                          data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                    Column name
                    <span class="caret"></span>
                  </button>
                  <ul class="dropdown-menu" aria-labelledby="dropdownMenu">
                    <li class="dropdown-header">Choose a column label</li>
                    <li><a href="#">Name of default file</a></li>
                    <li><a href="#">Another distribution</a></li>
                  </ul>
                </div>
              </div>
              <div class="axisY__wrapper">
                <h5>Y:</h5>
                <div class="dropdown">
                  <button class="btn btn-default btn-sm dropdown-toggle" type="button" id="dropdownMenu1"
                          data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                    Column name
                    <span class="caret"></span>
                  </button>
                  <ul class="dropdown-menu" aria-labelledby="dropdownMenu">
                    <li class="dropdown-header">Choose a column label</li>
                    <li><a href="#">Name of default file</a></li>
                    <li><a href="#">Another distribution</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section class="vizPreview__wrapper">
          <h4>Preview of dataset visualization</h4>

        {renderChart(state.chartType)}

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
});
