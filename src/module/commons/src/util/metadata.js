import registry from 'commons/registry';

export const getTitle = (entry) => {
  const namespaces = registry.get('namespaces');

  const md = entry.getMetadata();
  const subj = entry.getResourceURI();
  const title = md.findFirstValue(subj, namespaces.expand('dcterms:title'));

  return title;
};
