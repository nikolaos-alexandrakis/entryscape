import registry from 'commons/registry';

export const getTitle = (entry) => {
  const namespaces = registry.get('namespaces');

  const metadata = entry.getMetadata();
  const resourceURI = entry.getResourceURI();
  const title = metadata.findFirstValue(resourceURI, namespaces.expand('dcterms:title'));

  return title;
};


export const getModifiedDate = entry => entry.getEntryInfo().getModificationDate();
