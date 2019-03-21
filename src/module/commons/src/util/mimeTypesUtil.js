const mimeTypes = {
  'text/csv': 'csv',
  'text/plain': 'txt',
  'application/json': 'json',
  'application/pdf': 'pdf',
  'application/zip': 'zip',
  'application/xml': 'xml',
  'text/xml': 'xml',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-excel': 'xls',
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
