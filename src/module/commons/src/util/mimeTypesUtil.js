const mimeTypes = {
  'text/csv': 'csv',
  'application/json': 'json',
  'application/pdf': 'pdf',
  'application/zip': 'zip',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.oasis.opendocument.spreadsheet': 'ods',
};

/**
 *
 * @param mimeType
 * @return {*}
 */
const getAbbreviatedMimeType = mimeType => mimeTypes[mimeType];

export {
  getAbbreviatedMimeType,
};
