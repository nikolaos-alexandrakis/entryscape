import {
  getDatatsetByDistributionURI,
  getDistributionByFileResourceURI,
  getFileEntriesByResourceURI,
} from 'catalog/utils/dcatUtil';

/**
 * Retrieves the inverse property paths of the file/apis to their respective distribution and datasets.
 * Returns an array of two elements:
 *  1: A map of type <fleOrApiResourceURI, parentDistributionEntry>
 *  2: A map of type <fleOrApiResourceURI, parentDatasetEntry>
 *
 * @param distRURIs
 * @param context
 * @return {Promise<Map<string, store/Entry>[]>}
 */
const getDatasetByDistributionRURI = async (distRURIs, context) => {
  const fileORAPIRURIs = distRURIs.map(dist => dist.uri); // @todo valentino change name
  /**
   * Get the actual distribution entries from the file/api resource URI
   * @type {Map<string, store/Entry>}
   */
  const distributionEntries = await getDistributionByFileResourceURI(fileORAPIRURIs, context);

  /**
   * for each distribution entry get the resource URIs
   */
  const fileRURI2DistributionEntry = new Map(); // @todo @valentino better naming
  const distributions2Resources = new Map();
  for (const [ruri, entry] of distributionEntries) { // eslint-disable-line
    fileRURI2DistributionEntry.set(ruri, entry);

    if (distributions2Resources.has(entry.getResourceURI())) {
      const ruris = distributions2Resources.get(entry.getResourceURI());
      ruris.push(ruri);
      distributions2Resources.set(entry.getResourceURI(), ruris);
    } else {
      distributions2Resources.set(entry.getResourceURI(), [ruri]);
    }
  }
  const distributionRURIs = Array.from(distributions2Resources.keys());
  const datasetEntries = await getDatatsetByDistributionURI(distributionRURIs, context);
  const fileRURI2DatasetEntry = new Map();
  for (const [ruri, entry] of datasetEntries) { // eslint-disable-line
    const fileOrAPIRURIs = distributions2Resources.get(ruri);
    fileOrAPIRURIs.forEach(fileOrAPIRURI => fileRURI2DatasetEntry.set(fileOrAPIRURI, entry));
  }

  const fileOrAPIEntries = await getFileEntriesByResourceURI(fileORAPIRURIs, context);

  return [fileOrAPIEntries, fileRURI2DistributionEntry, fileRURI2DatasetEntry];
};


export default getDatasetByDistributionRURI;
