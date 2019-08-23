import filter from 'blocks/utils/filter';
import getEntry from 'blocks/utils/getEntry';
import getTextContent from 'blocks/utils/getTextContent';
import error from 'blocks/boot/error';
import { template } from 'lodash-es';

export default (node, data, items) => {
  filter.guard(node, data.if);

  if (data.json) {
    fetch(data.json).then(d => d.json()).then((loadedData) => {
      if (data.content) {
        node.innerHTML = template(data.content)(loadedData);
      } else if (data.property) {
        node.innerHTML = loadedData[data.property];
      }
    }).catch((e) => {
      data.error = e.toString();
      error(node, data);
    });
  } else {
    getEntry(data, (entry) => {
      node.innerHTML = getTextContent(data, entry) || data.fallback || '';
    });
  }
};
