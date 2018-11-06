import { EntryStoreUtil } from 'store/EntryStoreUtil';
import Graph from './Graph';
import triples from './triples';
import getEntry from '../utils/getEntry';

  export default (node, data, items) => {
    getEntry(data, (entry) => {
      const excludeArr = ['rdf:type', 'skos:broader', 'skos:inScheme', 'skos:topConceptOf'];
      const g = new Graph(node, triples.createLoader(excludeArr));
      g.load(entry.getResourceURI());
    });
  };
