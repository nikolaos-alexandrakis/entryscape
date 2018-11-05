import {utils, namespaces} from 'rdfjson';

const datasetType = namespaces.expand('dcat:Dataset');
const rdfType = namespaces.expand('rdf:type');

export default (target, sourcelist) => {
  const stmts = target.find(null, 'rdf:type', 'dcat:Catalog');
  const catURI = stmts[0].getSubject();

  sourcelist.forEach((source) => {
    const tstmts = source.find(null, 'rdf:type', 'dcat:Catalog');
    if (tstmts.length > 0) {
      const mergeCatURI = tstmts[0].getSubject();
      const ignore = {};
      ignore[namespaces.expand('dcat:dataset')] = true;
      utils.remove(source, mergeCatURI, ignore);
    }
    source.find().forEach((stmt) => {
      if (stmt.getValue() === datasetType &&
        stmt.getPredicate() === rdfType) {
        target.add(catURI, 'dcat:dataset', stmt.getSubject());
      }
      target.add(stmt);
    });
  });

  return target;
};
