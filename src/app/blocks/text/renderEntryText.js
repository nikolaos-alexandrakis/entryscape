define([
  'entryscape-commons/defaults',
  '../utils/filter',
  '../utils/getEntry',
  '../utils/getTextContent',
], (defaults, filter, getEntry, getTextContent) =>
  (node, data, items) => {
    filter.guard(node, data.if);
    getEntry(data, (entry) => {
      node.setAttribute('innerHTML', getTextContent(data, entry) || data.fallback || '');
    });
  });
