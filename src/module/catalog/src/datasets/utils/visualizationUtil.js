import { createEntry } from 'commons/util/storeUtil';

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

/**
 *
 * @param {store/Entry} datasetEntry
 * @param distributionRURI
 * @param configuration
 * @return {Promise<void>}
 */
const createVisualizationConfigurationEntry = async (datasetEntry, distributionRURI, configuration) => {
  const { chartType, xAxisField, yAxisField, operation } = configuration;
  const context = datasetEntry.getContext();
  const newEntryPrototype = await createEntry(context, 'store:Visualization');
  const newEntryRURI = newEntryPrototype.getResourceURI();
  const metadata = newEntryPrototype.getMetadata();

  // link visualization => distribution
  // metadata.add(newEntryRURI, 'rdf:type', 'schema:ImageObject');
  metadata.add(newEntryRURI, 'dcterms:source', distributionRURI);

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
    console.log(vizEntry);
    // link dataset => visualization
    const md = datasetEntry.getMetadata();
    md.add(datasetEntry.getResourceURI(), 'schema:diagram', vizEntry.getResourceURI()); // todo

    await datasetEntry.commitMetadata();
  } catch (e) {
    console.log('could not create visualization entry');
  }
};

export {
  createVisualizationConfigurationEntry,
};
