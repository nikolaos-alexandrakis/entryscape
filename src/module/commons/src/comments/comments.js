import registry from 'commons/registry';

const ns = registry.get('namespaces');
ns.add('oa', 'http://www.w3.org/ns/oa#');

const findAndDeleteReplies = (entry) => {
  const es = registry.get('entrystore');
  if (entry.getReferrers('oa:hasTarget').length > 0) {
    return es.newSolrQuery()
      .uriProperty('oa:hasTarget', entry.getResourceURI()).rdfType('oa:Annotation')
      .list()
      .forEach(replyEntry => findAndDeleteReplies(replyEntry).then(() => replyEntry.del()));
  }
  return Promise.all();
};

/**
 * Utility functions for working with comments.
 */
export default {
  deleteCommentAndReplies(entry) {
    return findAndDeleteReplies(entry).then(entry.del.bind(entry));
  },
  getCommentText(entry) {
    return entry.getMetadata().findFirstValue(null, 'rdf:value');
  },
  getCommentSubject(entry) {
    return entry.getMetadata().findFirstValue(null, 'dcterms:title');
  },
  getCommentor(entry) {
    const es = entry.getEntryStore();
    const userResourceUri = entry.getEntryInfo().getCreator();
    return es.getEntry(userResourceUri).then(userEntry => registry.get('rdfutils').getLabel(userEntry));
  },
  getNrOfReplies(entry) {
    return entry.getReferrers('oa:hasTarget').length;
  },
  getNrOfComments(entry) {
    // No assumption of current entry having a repository URI,
    // hence we need to make a search rather than check inv. rel. cache
    const es = registry.get('entrystore');
    const list = es.newSolrQuery().uriProperty('oa:hasTarget', entry.getResourceURI())
      .rdfType('oa:Annotation').limit(1)
      .list();
    return list.getEntries().then(() => list.getSize());
  },
  getReplyList(entry) {
    const es = registry.get('entrystore');
    return es.newSolrQuery()
      .uriProperty('oa:hasTarget', entry.getResourceURI())
      .rdfType('oa:Annotation')
      .sort('modified+asc')
      .list();
  },
  createReply(toEntry, subject, text) {
    const context = registry.get('context');
    const pCommentEntry = context.newEntry();
    const resourceURI = pCommentEntry.getResourceURI();
    const metadata = pCommentEntry.getMetadata();
    metadata.add(resourceURI, 'rdf:type', 'oa:Annotation');
    metadata.addL(resourceURI, 'dcterms:title', subject);
    metadata.add(resourceURI, 'oa:motivatedBy', 'oa:commenting');
    metadata.add(resourceURI, 'oa:hasTarget', toEntry.getResourceURI());
    const stmt = metadata.add(resourceURI, 'oa:hasBody');
    metadata.add(stmt.getValue(), 'rdf:type', 'oa:TextualBody');
    metadata.addL(stmt.getValue(), 'dc:format', 'text/plain');
    metadata.addL(stmt.getValue(), 'rdf:value', text);
    return pCommentEntry.commit();
  },
};
