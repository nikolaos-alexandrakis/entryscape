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
  console.log(uri);
  return new Promise((resolve) => {
    Papa.parse(uri, {
      download: true,
      header: true,
      complete: resolve,
    });
  });
};

export {
  createVisualizationConfigurationEntry,
  chartTypeToURI,
  chartURIToType,
  operationURIToType,
  parseCSVFile,
};
