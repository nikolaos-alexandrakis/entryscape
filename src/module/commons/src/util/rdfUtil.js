import { readFileAsText } from './fileUtil';

/**
 *
 * @param data
 */
const convertRDFData = (data) => {
  const report = converters.detect(data);
  if (!report.error) {
    this.callback(report.graph, val);
  } else {
    throw report.error;
  }
};
