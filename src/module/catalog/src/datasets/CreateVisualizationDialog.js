import { getUploadedDistributionEntries } from 'catalog/datasets/utils/datasetUtil';
import { getDistributionFileEntries } from 'catalog/datasets/utils/distributionUtil';
import { createVisualizationConfigurationEntry } from 'catalog/datasets/utils/visualizationUtil';
import escaVisualization from 'catalog/nls/escaVisualization.nls';
import TypeSelector from 'catalog/visualization/components/DistributionSelector';
import AxisSelector from 'catalog/visualization/components/AxisSelector';
import DistributionSelector from 'catalog/visualization/components/TypeSelector';
import VisualizationChart from 'catalog/visualization/components/VisualizationChart';
import TitleDialog from 'commons/dialog/TitleDialog';
import { getEntryRenderName } from 'commons/util/entryUtil';
import { createSetState } from 'commons/util/util';
import declare from 'dojo/_base/declare';
import m from 'mithril';
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


  const rowsToCheckCount = Math.min(3, csvData.data.length);
  for (let i = 0; i < rowsToCheckCount; i++) {
    const dataRow = csvData.data[i];

    Object.keys(dataRow).forEach((dataPoint, idx) => {
      const dataValue = dataRow[dataPoint];
      if (!csvDataDetectedTypes[idx]) {
        if (!isNaN(Number(dataValue))) { // it's a number
          csvDataDetectedTypes[idx] = CSV_COLUMN_TYPE.NUMBER;
        }
      }
    });
  }
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
  operation: 'none',
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
            xAxisField: csvData.meta.fields[latIdx],
            yAxisField: csvData.meta.fields[longIdx],
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
          files={[]}
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
              onSelect={onAxisUpdate}
            />
          </div>
        </section>

        <section class="vizPreview__wrapper">
          <h4>Preview of dataset visualization</h4>

          <VisualizationChart
            type={state.chartType}
            xAxisField={state.xAxisField}
            yAxisField={state.xAxisField}
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
