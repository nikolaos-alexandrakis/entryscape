import configUtil from './configUtil';

const isFileTooLarge = file => file.size > configUtil.uploadFileSizeLimit;

/**
 *
 * @param file
 * @param callback
 * @param encoding
 * @returns {Promise}
 */
const readFileAsText = (file, encoding = 'UTF-8') => {
  if (isFileTooLarge(file)) {
    return Promise.reject('file is too large johnny!');
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    // reader.onabort = () => callback('abort'); // TODO not supported on IE11?
    reader.readAsText(file, encoding);
  });
};

export {
  readFileAsText,
};
