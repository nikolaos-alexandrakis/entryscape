import registry from 'commons/registry';

export const getTitle = (entry) => {
  const namespaces = registry.get('namespaces');

  const metadata = entry.getMetadata();
  const resourceURI = entry.getResourceURI();
  const name = metadata.findFirstValue(resourceURI, namespaces.expand('foaf:name'));

  if (!name) {
    return metadata.findFirstValue(resourceURI, namespaces.expand('dcterms:title'));
  }

  return name;
};

export const getModifiedDate = entry => entry.getEntryInfo().getModificationDate();
