import { createEntry } from 'commons/util/storeUtil';

/**
 *
 * @param {store/Entry} datasetEntry
 * @param distributionRURI
 * @param configuration
 * @return {Promise<void>}
 */
const createVisualizationConfigurationEntry = async (datasetEntry, distributionRURI, configuration) => {
  const { chartType, x, y, op } = configuration;
  const context = datasetEntry.getContext();
  const newEntryPrototype = await createEntry(context, 'store:Visualization');
  const newEntryRURI = newEntryPrototype.getResourceURI();
  const metadata = newEntryPrototype.getMetadata();

  // link visualization => distribution
  // metadata.add(newEntryRURI, 'rdf:type', 'schema:ImageObject');
  metadata.add(newEntryRURI, 'dcterms:source', distributionRURI);
  metadata.add(newEntryRURI, 'store:style', chartType);
  metadata.add(newEntryRURI, 'store:x', x);
  metadata.add(newEntryRURI, 'store:y', y);
  metadata.add(newEntryRURI, 'store:op', op);

  try {
    await newEntryPrototype.commit();
  } catch (e) {
    console.log('could not create visualization entry');
    return;
  }

  // link dataset => visualization
  const md = datasetEntry.getMetadata();
  md.add(datasetEntry.getResourceURI(), 'schema:diagram', newEntryRURI); // todo

  await datasetEntry.commitMetadata();
};

export {
  createVisualizationConfigurationEntry,
};
