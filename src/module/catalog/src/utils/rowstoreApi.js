/**
 * Get the UUID from a distribution Entry
 * @param {store/Entry} entry
 * @return {string}
 */
const getRowstoreAPIUUID = (entry) => {
  const rowstoreURI = entry.getMetadata().findFirstValue(null, 'dcat:accessURL');

  // rowstoreURI looks like <base>/rowstore/dataset/<uuid>
  return rowstoreURI.split('/').pop();
};

export {
  getRowstoreAPIUUID,
};
