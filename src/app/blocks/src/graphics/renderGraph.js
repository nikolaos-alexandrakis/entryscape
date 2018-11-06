define([
  'store/EntryStoreUtil',
  './Graph',
  './triples',
  '../utils/getEntry',
], (EntryStoreUtil, Graph, triples, getEntry) =>
  function (node, data, items) {
    getEntry(data, (entry) => {
      const excludeArr = ['rdf:type', 'skos:broader', 'skos:inScheme', 'skos:topConceptOf'];
      const g = new Graph(node, triples.createLoader(excludeArr));
      g.load(entry.getResourceURI());
    });
  });
