import { getUploadedDistributionEntries } from 'catalog/datasets/utils/datasetUtil';
import { getDistributionFileEntries } from 'catalog/datasets/utils/distributionUtil';
import { createVisualizationConfigurationEntry } from 'catalog/datasets/utils/visualizationUtil';
import escaVisualization from 'catalog/nls/escaVisualization.nls';
import AxisSelector from 'catalog/visualization/components/AxisSelector';
import DistributionSelector from 'catalog/visualization/components/DistributionSelector';
import TypeSelector from 'catalog/visualization/components/TypeSelector';
import VisualizationChart from 'catalog/visualization/components/VisualizationChart';
import TitleDialog from 'commons/dialog/TitleDialog';
import { getEntryRenderName } from 'commons/util/entryUtil';
import { createSetState } from 'commons/util/util';
import declare from 'dojo/_base/declare';
import m from 'mithril';
import moment from 'moment';
import Papa from 'papaparse';
import './CreateVisualizationDialog.scss';

let csvData;
let csvDataDetectedTypes;
const updateCSVData = (data) => {
  csvData = data;
  m.redraw();
  detectTypes();
};

const CSV_COLUMN_TYPE = {
  NONE: 'none',
  NUMBER: 'number',
  DATE: 'date',
  GEO_LAT: 'geo-latitude',
  GEO_LONG: 'geo-longitude',
  TEXT: 'text',
  DISCRETE: 'discrete'
};

const CSV_ROWS_TO_SNIFF = 20;

/**
 *
 * @param {number} n
 * @return {boolean}
 */
const isPotentiallyLatitude = n => (-90 <= n && n >= 90);

/**
 *
 * @param {number} n
 * @return {boolean}
 */
const isPotentiallyLongitude = n => (-180 <= n && n >= 180);

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

/**
 *
 * @param data
 * @param column
 * @param count
 * @return {*}
 */
const getColumnSpecificRandomRowValues = (data, column, count = CSV_ROWS_TO_SNIFF) => {
  const randomData = [];
  const maxInteger = data.length - 1;
  for (let i = 0; i < count; i++) {
    const idx = getRandomInt(maxInteger);
    randomData.push(data[idx][column]);
  }

  return randomData;
};

const DISCREET_THRESHOLD = 20; // random

const isPotentiallyDiscrete = (array, totalValues) => {
  const discreteValues = new Set(array).size;
  let threshold = DISCREET_THRESHOLD;
  if (totalValues < threshold) {
    threshold = array.length - 1; // at least one value is repeated twice
  }
  return discreteValues > 0 && (discreteValues < threshold); // @todo very random: discrete value means no more than 20
};

const detectTypes = () => {
  const columns = csvData.meta.fields;

  // pre-liminary check of common names, latitude/longitude
  csvDataDetectedTypes = columns.map((column) => {
    const normalizedColumnName = column.toLowerCase();
    if (normalizedColumnName.includes('latitude')) {
      return CSV_COLUMN_TYPE.GEO_LAT;
    }
    if (normalizedColumnName.includes('longitude')) {
      return CSV_COLUMN_TYPE.GEO_LONG;
    }
    if (normalizedColumnName.includes('date')) {
      return CSV_COLUMN_TYPE.DATE;
    }

    return null;
  });

  const rowsToCheckCount = Math.min(CSV_ROWS_TO_SNIFF, csvData.data.length);
  columns.forEach((column, idx) => {
    // this is used as a benchmark to check against
    // if the detected type in the rows is not consistent with this then ignore type detection
    let detectedType = csvDataDetectedTypes[idx];

    for (let i = 0; i < rowsToCheckCount; i++) {
      const dataPoint = csvData.data[i][column];

      if (!dataPoint) { // empty string
        break;
      }

      if (moment(dataPoint).isValid()) {
        if (detectedType && detectedType !== CSV_COLUMN_TYPE.DATE) {
          break;
        }
        detectedType = CSV_COLUMN_TYPE.DATE;
      } else if (!isNaN(Number(dataPoint))) { // it's a number
        // check if it looks like a coordinate
        if (isPotentiallyLongitude(dataPoint)) {
          if (detectedType &&
            (detectedType !== CSV_COLUMN_TYPE.GEO_LONG || detectedType !== CSV_COLUMN_TYPE.GEO_LAT)) {
            if (detectedType !== CSV_COLUMN_TYPE.NUMBER) {
              break;
            }
            detectedType = CSV_COLUMN_TYPE.NUMBER; // it looked like a co-ordinate before but it's most probably a number
          }
          detectedType = CSV_COLUMN_TYPE.GEO_LONG;
          if (isPotentiallyLatitude(dataPoint)) {
            detectedType = CSV_COLUMN_TYPE.GEO_LAT;
          }
        } else {
          if (detectedType && detectedType !== CSV_COLUMN_TYPE.NUMBER) {
            break;
          }
          detectedType = CSV_COLUMN_TYPE.NUMBER;
        }
      } else {
        const randomValues = getColumnSpecificRandomRowValues(csvData.data, column);
        if (isPotentiallyDiscrete(randomValues, csvData.data.length)) {
          detectedType = CSV_COLUMN_TYPE.DISCRETE;
          break;
        }

        detectedType = CSV_COLUMN_TYPE.TEXT;
      }
    }

    csvDataDetectedTypes[idx] = detectedType;
  });

  const mappings = new Map();
  csvData.meta.fields.forEach((field, idx) => {
    mappings.set(field, csvDataDetectedTypes[idx]);
  });
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

const parseCSVFile = (uri) => {
  return new Promise((resolve, reject) => {
    Papa.parse(uri, {
      download: true,
      header: true,
      complete: resolve,
    });
  });
};

const state = {
  distributionFile: null,
  chartType: 'map',
  operation: null,
  xAxisField: null,
  yAxisField: null,
};

const getControllerComponent = (datasetEntry, files) => {
  const setState = createSetState(state);

  const findSensibleXndY = (type) => {
    const selectedType = type || state.chartType;
    if (selectedType === 'map') {
      const latIdx = csvDataDetectedTypes.findIndex(detectedType => detectedType === CSV_COLUMN_TYPE.GEO_LAT);
      let longIdx = -1;
      if (latIdx !== -1) {
        longIdx = csvDataDetectedTypes.findIndex(detectedType => detectedType === CSV_COLUMN_TYPE.GEO_LONG);

        if (latIdx && longIdx !== -1) {
          setState({
            xAxisField: csvData.meta.fields[longIdx],
            yAxisField: csvData.meta.fields[latIdx],
          });
        }
      }
    }
  };

  const onTypeChange = (type) => {
    setState({ chartType: type });
    findSensibleXndY(type);
  };
  const onAxisUpdate = fields => setState({
    xAxisField: fields.x,
    yAxisField: fields.y,
    operation: fields.operation,
  });

  const onChangeSelectedFile = (evt) => {
    const fileURI = evt.target.value;
    if (!state.distributionFile || (state.distributionFile.uri !== fileURI)) {
      const distributionFile = files.find(file => file.uri === fileURI);
      setState({
        distributionFile,
      });

      parseCSVFile(distributionFile.uri)
        .then(updateCSVData)
        .then(findSensibleXndY); // should have a spinner loading
    }
  };


  return {
    oncreate() {
      const distributionFile = files[0]; // default selected

      parseCSVFile(distributionFile.uri)
        .then(updateCSVData)
        .then(findSensibleXndY); // should have a spinner loading

      setState({
        distributionFile,
      });
    },
    view() {
      const hasData = state.distributionFile && csvData;
      return <section class="viz__editDialog">
        <section class="viz__intro">
        </section>
        <section class="useFile">
          <h4>Distribution</h4>
          <DistributionSelector
            files={files}
            onChangeSelectedFile={onChangeSelectedFile}
          />
        </section>
        <section class="graphType__wrapper">
          <h4>Type of visualization</h4>
          <p> Choose a type of visualization.Consider that not all data work fine with all representations</p>
          <TypeSelector
            type={state.chartType}
            onSelect={onTypeChange}
          />
        </section>

        <section class="axisOperation__wrapper">
          <div class="axisOptions">
            <h4>Axes to use</h4>
            <p>Select which data you want to show on each axis.</p>
            <p>On axis X you can select an operator to create more complicated visualizations.</p>
            <AxisSelector
              x={state.xAxisField}
              y={state.yAxisField}
              operation={state.operation}
              data={csvData}
              type={state.chartType}
              onSelect={onAxisUpdate}
            />
          </div>
        </section>

        <section class="vizPreview__wrapper">
          <h4>Preview of dataset visualization</h4>

          <VisualizationChart
            type={state.chartType}
            xAxisField={state.xAxisField}
            yAxisField={state.yAxisField}
            operation={state.operation}
            data={csvData}
          />
        </section>
      </section>;
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
