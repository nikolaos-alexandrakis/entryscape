define([
  'entryscape-commons/defaults',
  'rdfjson/namespaces',
  '../utils/labels',
], (defaults, namespaces, labels) => {
  const es = defaults.get('entrystore');
  const esu = defaults.get('entrystoreutil');

  return {
    createLoader(excludeProps) {
      const excludeIdx = {};
      excludeProps.forEach((prop) => {
        excludeIdx[namespaces.expand(prop)] = true;
      });
      const filterTriple = stmt => !excludeIdx[stmt.getPredicate()];

      return (uri, loaded) => esu.getEntryByResourceURI(uri).then((e) => {
        const triples = [];
        const ids = [uri];
        const stmts = e.getMetadata().find(uri);
        stmts.filter(filterTriple).forEach((stmt) => {
          if (stmt.getType() === 'uri') {
            const o = stmt.getValue();
            if (!loaded[o] && uri !== o) {
              triples.push({ s: uri, p: stmt.getPredicate(), o });
              ids.push(o);
            }
          }
        });

        return es.newSolrQuery().objectUri(uri).forEach((inboundEntry) => {
          const inbURI = inboundEntry.getResourceURI();
          const inbStmts = inboundEntry.getMetadata().find(inbURI, null, uri);
          inbStmts.filter(filterTriple).forEach((stmt) => {
            if (!loaded[inbURI] && inbURI !== uri) {
              triples.push({ s: inbURI, p: stmt.getPredicate(), o: uri });
              ids.push(inbURI);
            }
          });
        }).then(() => labels(ids).then((id2label) => {
          triples.forEach((t) => {
            t.sl = id2label[t.s] || namespaces.shortenKnown(t.s);
            t.ol = id2label[t.o] || namespaces.shortenKnown(t.o);
            t.pl = namespaces.shortenKnown(t.p);
          });
          return triples;
        }));
      });
    },
  };
});

