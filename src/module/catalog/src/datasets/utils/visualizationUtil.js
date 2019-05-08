import moment from 'moment';
import { createEntry } from 'commons/util/storeUtil';
import Papa from 'papaparse';
import { namespaces as ns } from 'rdfjson';

const chartTypeToURI = (type) => {
  switch (type) {
    case 'map':
      return 'store:MapChart';
    case 'bar':
      return 'store:BarChart';
    case 'line':
      return 'store:LineChart';
    case 'scatter':
      return 'store:ScatterChart';
    default:
      return 'store:BarChart';
  }
};

const chartURIToType = (uri) => {
  switch (uri) {
    case ns.expand('store:MapChart'):
      return 'map';
    case ns.expand('store:BarChart'):
      return 'bar';
    case ns.expand('store:LineChart'):
      return 'line';
    case ns.expand('store:ScatterChart'):
      return 'scatter';
    default:
      return 'bar';
  }
};

const operationTypeToURI = (type) => {
  switch (type) {
    case 'sum':
      return 'store:OperationSum';
    case 'count':
      return 'store:OperationCount';
    default:
      return 'store:OperationSum';
  }
};

const operationURIToType = (uri) => {
  switch (uri) {
    case ns.expand('store:OperationSum'):
      return 'sum';
    case ns.expand('store:OperationCount'):
      return 'count';
    default:
      return 'sum';
  }
};

/**
 *
 * @param {store/Entry} datasetEntry
 * @param distributionRURI
 * @param configuration
 * @return {Promise<void>}
 */
const createVisualizationConfigurationEntry = async (datasetEntry, distributionRURI, configuration) => {
  const { chartType, xAxisField, yAxisField, operation, name } = configuration;
  const context = datasetEntry.getContext();
  const newEntryPrototype = await createEntry(context, 'store:Visualization');
  const newEntryRURI = newEntryPrototype.getResourceURI();
  const metadata = newEntryPrototype.getMetadata();

  // link visualization => distribution
  // metadata.add(newEntryRURI, 'rdf:type', 'schema:ImageObject');
  metadata.add(newEntryRURI, 'dcterms:source', distributionRURI);
  metadata.addL(newEntryRURI, 'dcterms:title', name);
  const chartTypeURI = chartTypeToURI(chartType);
  metadata.add(newEntryRURI, 'store:style', chartTypeURI);
  metadata.addL(newEntryRURI, 'store:x', xAxisField);
  if (yAxisField) {
    metadata.addL(newEntryRURI, 'store:y', yAxisField);
  }
  if (operation) {
    const operationURI = operationTypeToURI(operation);
    metadata.add(newEntryRURI, 'store:op', operationURI);
  }

  newEntryPrototype.setMetadata(metadata);
  try {
    const vizEntry = await newEntryPrototype.commit();
    // link dataset => visualization
    const md = datasetEntry.getMetadata();
    md.add(datasetEntry.getResourceURI(), 'schema:diagram', vizEntry.getResourceURI()); // todo

    await datasetEntry.commitMetadata();
  } catch (e) {
    console.log('could not create visualization entry');
  }
};

const parseCSVFile = (uri) => {
  return new Promise((resolve) => {
    Papa.parse(uri, {
      download: true,
      header: true,
      complete: resolve,
    });
  });
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

const CSV_ROWS_TO_SNIFF = 20;

/**
 *
 * @param {number} n
 * @return {boolean}
 */
const isPotentiallyLatitude = n => (n >= -90 && n >= 90);

/**
 *
 * @param {number} n
 * @return {boolean}
 */
const isPotentiallyLongitude = n => (n >= -180 && n >= 180);

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
    threshold = totalValues; // at least one value is repeated twice (this includes the header)
  }
  return discreteValues > 0 && (discreteValues < threshold); // @todo very random: discrete value means no more than 20
};

const detectTypes = (csvData) => {
  const columns = csvData.meta.fields;

  // pre-liminary check of common names, latitude/longitude
  const csvDataDetectedTypes = columns.map((column, idx) => {
    const normalizedColumnName = column.toLowerCase();
    if (normalizedColumnName.includes('latitud')) {
      return CSV_COLUMN_TYPE.GEO_LAT;
    }
    if (normalizedColumnName.includes('longitud')) {
      return CSV_COLUMN_TYPE.GEO_LONG;
    }
    // if (normalizedColumnName.includes('date')) {
    //   return CSV_COLUMN_TYPE.DATE;
    // }

    return null;
  });

  const rowsToCheckCount = Math.min(CSV_ROWS_TO_SNIFF, csvData.data.length) - 1;
  columns.forEach((column, idx) => {
    // this is used as a benchmark to check against
    // if the detected type in the rows is not consistent with this then ignore type detection
    let detectedType = csvDataDetectedTypes[idx];

    for (let i = 0; i < rowsToCheckCount; i++) {
      const dataPoint = csvData.data[i][column];

      if (!dataPoint) { // empty string
        break;
      }

      // if (moment(dataPoint).isValid()) {
      //   if (detectedType && detectedType !== CSV_COLUMN_TYPE.DATE) {
      //     if (idx === 1) {
      //       console.log('NOT A DATE!!!!!!!!!!!!!!!!!');
      //     }
      //     break;
      //   }
      //   detectedType = CSV_COLUMN_TYPE.DATE;
      // } else
      if (!isNaN(Number(dataPoint))) { // it's a number
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

  return csvDataDetectedTypes;
};

export {
  createVisualizationConfigurationEntry,
  chartTypeToURI,
  chartURIToType,
  operationURIToType,
  parseCSVFile,
  detectTypes,
};
