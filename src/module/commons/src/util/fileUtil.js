import escoProgressTask from 'commons/nls/escoProgressTask.nls';
import { i18n } from 'esi18n';
import configUtil from './configUtil';

const isFileTooLarge = file => file.size > configUtil.uploadFileSizeLimit;

/**
 *
 * @param file
 * @param encoding
 * @returns {Promise}
 */
const readFileAsText = (file, encoding = 'UTF-8') => {
  if (isFileTooLarge(file)) {
    return Promise.reject(
      i18n.localize(escoProgressTask, 'uploadFileSizeLimit', { limit: configUtil.uploadFileSizeLimit }),
    );
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
