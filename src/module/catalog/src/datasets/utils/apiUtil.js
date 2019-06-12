import escaApiProgressNLS from 'catalog/nls/escaApiProgress.nls';
import registry from 'commons/registry';
import { i18n } from 'esi18n';
import { promiseUtil } from 'store';

/**
 * The index (order) of the statuses corresponds to the pipeline return status.
 * Do not change if not changed in the RowStore/EntryStore
 * @type {string[]}
 */
const id2status = [
  'created',
  'accepted',
  'processing',
  'available',
  'error',
];

/**
 * Load the RowStore data for this entry
 * @param {store/Entry} pipelineEntry
 * @return {xhrPromise}
 */
const load = pipelineEntry => registry.getEntryStore()
  .loadViaProxy(pipelineEntry.getEntryInfo().getExternalMetadataURI());

/**
 *
 * @param {store/Entry} pipelineEntry
 * @return {String}
 */
const oldStatus = pipelineEntry => pipelineEntry.getCachedExternalMetadata()
  .findFirstValue(pipelineEntry.getResourceURI(), 'store:pipelineResultStatus');

/**
 * Transform the RowStore status value to string
 * @see id2status
 * @param {object} data
 * @return {string}
 */
const status = data => id2status[data.status];


/**
 * Get entry from EntryStore and not cache
 * @param {store/Entry} entry
 * @private
 */
const _refreshEntry = (entry) => {
  entry.setRefreshNeeded();
  return entry.refresh();
};

/**
 * Update the external metadata of the entry from given data object
 *
 * @param {store/Entry} pipelineEntry
 * @param {object} data
 * @return {Promise}
 */
const update = async (pipelineEntry, data) => {
  // get a fresh copy of the entry
  await _refreshEntry(pipelineEntry);

  const newStatus = id2status[data.status];
  const extMD = pipelineEntry.getCachedExternalMetadata();
  const resURI = pipelineEntry.getResourceURI();

  // update status
  extMD.findAndRemove(resURI, 'store:pipelineResultStatus');
  extMD.addL(resURI, 'store:pipelineResultStatus', newStatus);

  // update columns
  extMD.findAndRemove(resURI, 'store:pipelineResultColumnName');
  if (newStatus === 'available' && data.columnnames) {
    data.columnnames.forEach(col => extMD.addL(resURI, 'store:pipelineResultColumnName', col));
  }
  // update aliases
  extMD.findAndRemove(resURI, 'store:aliasName');
  if (data.aliases && data.aliases.length > 0) {
    extMD.addL(resURI, 'store:aliasName', data.aliases[0]);
  }

  return pipelineEntry.commitCachedExternalMetadata();
};

const updateAliasInEntry = (etlEntry, aliasName) => {
  const extMD = etlEntry.getCachedExternalMetadata();
  const resURI = etlEntry.getResourceURI();
  if (aliasName) {
    extMD.addL(resURI, 'store:aliasName', aliasName);
  } else {
    extMD.findAndRemove(resURI, 'store:aliasName');
  }
  return etlEntry.commitCachedExternalMetadata();
};


/**
 * Synchronizes the API status values between what was returned from RowStore and what is
 * saved in the external metadata graph
 * @param pipelineEntryURI
 * @return {Promise<string>}
 * @see update
 */
const syncStatus = async (pipelineEntryURI) => {
  const pipelineEntry = await registry.getEntryStore().getEntry(pipelineEntryURI);
  const data = await load(pipelineEntry);
  const newStatus = status(data);
  if (newStatus !== oldStatus(pipelineEntry)) {
    await update(pipelineEntry, data);
  }
  return newStatus;
};

const STATUS_CHECK_REPEATS = 50;
const STATUS_CHECK_DELAY_MILLIS = 500;

/**
 * Recursive function that returns only whe the api status is 'available' or throws error.
 * Otherwise keeps looping every certain millis
 * @param {store/Entry} pipelineEntryURI
 * @param {number} repeat how many times should we re-try to find the API in an available status
 * @param {number} delayMillis how many millis to delay before trying again
 * @return {Promise<String>}
 * @throws
 */
const checkStatusOnRepeat = async (
  pipelineEntryURI,
  repeat = STATUS_CHECK_REPEATS,
  delayMillis = STATUS_CHECK_DELAY_MILLIS) => {
  const newStatus = await syncStatus(pipelineEntryURI);
  const escaApiProgress = i18n.getLocalization(escaApiProgressNLS);
  switch (newStatus) {
    case 'available':
      return '';
    case 'error':
      throw Error(escaApiProgress.apiProgressError); // reject();
    default:
      // retry checking the API after 'delayMillis'
      if (repeat > 0) {
        await promiseUtil.delay(delayMillis);
        return checkStatusOnRepeat(pipelineEntryURI, repeat - 1);
      }
      return escaApiProgress.apiProgressWarning;
  }
};

export default {
  load,
  oldStatus,
  status,
  update,
  updateAliasInEntry,
  checkStatusOnRepeat,
};
