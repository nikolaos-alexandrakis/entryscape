import filter from 'blocks/utils/filter';
import getEntry from 'blocks/utils/getEntry';
import getTextContent from 'blocks/utils/getTextContent';

  export default (node, data, items) => {
    filter.guard(node, data.if);

    getEntry(data, (entry) => {
      node.innerHTML = getTextContent(data, entry) || data.fallback || '';
    });
  };
