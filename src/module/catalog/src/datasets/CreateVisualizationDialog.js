import { getUploadedDistributionEntries } from 'catalog/datasets/utils/datasetUtil';
import { getDistributionFileEntries } from 'catalog/datasets/utils/distributionUtil';
import {
  createVisualizationConfigurationEntry,
  detectTypes,
  parseCSVFile,
} from 'catalog/datasets/utils/visualizationUtil';
import escaVisualizationNLS from 'catalog/nls/escaVisualization.nls';
import AxisSelector from 'catalog/visualization/components/AxisSelector';
import DistributionSelector from 'catalog/visualization/components/DistributionSelector';
import TypeSelector from 'catalog/visualization/components/TypeSelector';
import VisualizationChart from 'catalog/visualization/components/VisualizationChart';
import TitleDialog from 'commons/dialog/TitleDialog';
import { getEntryRenderName } from 'commons/util/entryUtil';
import { createSetState } from 'commons/util/util';
import declare from 'dojo/_base/declare';
import { i18n } from 'esi18n';
import m from 'mithril';
import './CreateVisualizationDialog.scss';

let csvData;
let csvDataDetectedTypes;
const updateCSVData = (data) => {
  csvData = data;
  csvDataDetectedTypes = detectTypes(csvData);
  console.log(csvDataDetectedTypes);
  m.redraw();
};

const CSV_COLUMN_TYPE = {
  NONE: 'none',
  NUMBER: 'number',
  // DATE: 'date',
  GEO_LAT: 'geo-latitude',
  GEO_LONG: 'geo-longitude',
  TEXT: 'text',
  DISCRETE: 'discrete',
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

const state = {
  distributionFile: null,
  chartType: 'map',
  operation: null,
  xAxisField: null,
  yAxisField: null,
};

const getControllerComponent = (datasetEntry, files) => {
  const setState = createSetState(state);

  const getSensibleHeadersForChartType = (type) => {
    if (csvData) {
      const selectedType = type || state.chartType;
      const headers = csvData.meta.fields;

      return headers.filter((header, idx) => {
        switch (selectedType) {
          case 'map':
            if (csvDataDetectedTypes[idx] === CSV_COLUMN_TYPE.GEO_LAT ||
              csvDataDetectedTypes[idx] === CSV_COLUMN_TYPE.GEO_LONG) {
              return true;
            }
            break;
          case 'bar':
            if (csvDataDetectedTypes[idx] === CSV_COLUMN_TYPE.DISCRETE ||
              csvDataDetectedTypes[idx] === CSV_COLUMN_TYPE.NUMBER) {
              return true;
            }
            break;
          case 'line':
            if (csvDataDetectedTypes[idx] === CSV_COLUMN_TYPE.NUMBER) {
              return true;
            }
            break;
          default:
            break;
        }
        return false;
      });
    }

    return [];
  };

  const setSensibleDefaults = (type) => {
    const selectedType = type || state.chartType;
    const sensibleHeaders = getSensibleHeadersForChartType();

    switch (selectedType) {
      case 'map':
        // const latIdx = sensibleHeaders.findIndex(detectedType => detectedType === CSV_COLUMN_TYPE.GEO_LAT);
        // let longIdx = -1;
        // if (latIdx !== -1) {
          // longIdx = sensibleHeaders.findIndex(detectedType => detectedType === CSV_COLUMN_TYPE.GEO_LONG);

          // if (latIdx && longIdx !== -1) {
        if (sensibleHeaders.length > 1) {
            // setState({
              // xAxisField: sensibleHeaders[0],
              // yAxisField: sensibleHeaders[1],
            // });
        } else if (sensibleHeaders.length === 1) {
            // setState({
              // xAxisField: sensibleHeaders[0],
            // });
        }
          // }
        // }
        break;
      case 'bar':
      case 'line':
        // 1. time series
        // 2. discrete value with operation
        // 3.
        // const timeIdx = sensibleHeaders.findIndex(detectedType => detectedType === CSV_COLUMN_TYPE.DATE);
        const numberIdx = sensibleHeaders.findIndex(detectedType => detectedType === CSV_COLUMN_TYPE.NUMBER);
        const discreteIdx = sensibleHeaders.findIndex(detectedType => detectedType === CSV_COLUMN_TYPE.DISCRETE);
        // if (timeIdx > -1 && numberIdx > -1) {
        //   setState({
        //     xAxisField: sensibleHeaders[timeIdx],
        //     yAxisField: sensibleHeaders[numberIdx],
        //   });
        // } else
        if (discreteIdx > -1 && numberIdx > -1) {
          setState({
            xAxisField: sensibleHeaders[discreteIdx],
            yAxisField: sensibleHeaders[numberIdx],
            operation: 'sum',
          });
        }

        break;
    }
  };

  const onTypeChange = (type) => {
    setState({ chartType: type });
    setSensibleDefaults(type);
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
      registry.get('dialogs').progress(
        parseCSVFile(distributionFile.uri)
          .then(updateCSVData)
          .then(setSensibleDefaults) // should have a spinner loading
      );
    }
  };

  const updateVisualizationName = (evt) => {
    // setState({
    //   name: evt.target.value,
    // }, true);
  };


  return {
    oncreate() {
      const distributionFile = files[0]; // default selected

      if (distributionFile) {
        parseCSVFile(distributionFile.uri)
          .then(updateCSVData)
          .then(setSensibleDefaults); // should have a spinner loading

        setState({
          distributionFile,
        });
      }
    },
    view() {
      const hasData = state.distributionFile && csvData;
      let fields = [];
      if (hasData) {
        fields = getSensibleHeadersForChartType();
      }
      const escaVisualization = i18n.getLocalization(escaVisualizationNLS);

      if(hasData) {
      return <section class="viz__editDialog">
        <section class="graphType__wrapper">
          <h4>{escaVisualization.vizDialogTypeTitle}</h4>
          <TypeSelector
            type={state.chartType}
            onSelect={onTypeChange}
          />
        </section>

        <section class="useFile">
          <h4>{escaVisualization.vizDialogDistributionTitle}</h4>
          <DistributionSelector
            files={files}
            onChangeSelectedFile={onChangeSelectedFile}
          />

          <div className="form-group">
            <label>{escaVisualization.vizDialogNameviz}</label>
            <input className="form-control" id="visualization-name" placeholder="Visualization name"/>
          </div>
        </section>


        <section class="axisOperation__wrapper">
          <div class="axisOptions">
            <h4>{escaVisualization.vizDialogAxesTitle}</h4>
            <AxisSelector
              x={state.xAxisField}
              y={state.yAxisField}
              operation={state.operation}
              fields={fields}
              type={state.chartType}
              onSelect={onAxisUpdate}
            />
          </div>
        </section>

        <section class="vizPreview__wrapper">
          <h4>{escaVisualization.vizDialogPreview}</h4>

          <VisualizationChart
            type={state.chartType}
            xAxisField={state.xAxisField}
            yAxisField={state.yAxisField}
            operation={state.operation}
            data={csvData}
          />
        </section>
        </section>;
    }
    return <section class="viz__editDialog">
            <p>Please add a distribution to your dataset before creating a visualization</p>
          </section>;
    },
  };
};

export default declare([TitleDialog.ContentComponent], {
  nlsBundles: [{ escaVisualizationNLS }],
  nlsHeaderTitle: 'vizDialogTitle',
  nlsFooterButtonLabel: 'vizDialogFooter',
  async open(params) {
    this.onDone = params.onDone;
    const { entry: datasetEntry } = params;
    this.entry = datasetEntry;

    const files = await getCSVFiles(datasetEntry);
    this.controllerComponent = getControllerComponent(datasetEntry, files);

    this.show(this.controllerComponent);
    this.dialog.show();
  },
  footerButtonAction() {
    const { distributionFile } = state;
    if(distributionFile) {
      state.name = document.getElementById('visualization-name').value;
      return createVisualizationConfigurationEntry(this.entry, distributionFile.distributionRURI, state)
        .then(console.log)
        .then(this.onDone)
        .catch(console.log);
    } else {
      return true;
    }
  },
});
