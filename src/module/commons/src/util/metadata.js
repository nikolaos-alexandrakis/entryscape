import registry from 'commons/registry';

// UTILS
const getChoiceLabels = (entry, property, choiceTemplateId) => {
  const choices = registry.get('itemstore').getItem(choiceTemplateId).getChoices();

  return entry.getMetadata().find(entry.getResourceURI(), property)
    .map(statement => statement.getValue())
    .map(uri => choices.find(choice => choice.value === uri) )
    .map(choice => registry.get('localize')(choice.label));
};
const getSolrQueryResults = (entry, type, onSuccess) => {
  const context = registry.get('context');
  const es = registry.get('entrystore');
  const ns = registry.get('namespaces');

  es.newSolrQuery().rdfType(ns.expand(type))
    .uriProperty('dcterms:source', entry.getResourceURI())
    .context(context.getResourceURI())
    .getEntries()
    .then(onSuccess);
};
// END UTILS

export const getTitle = (entry) => {
  const metadata = entry.getMetadata();
  const resourceURI = entry.getResourceURI();
  const name = metadata.findFirstValue(resourceURI, 'foaf:name');

  if (!name) {
    return metadata.findFirstValue(resourceURI, 'dcterms:title');
  }

  return name;
};
export const getDescription = (entry) => {
  const metadata = entry.getMetadata();
  const resourceURI = entry.getResourceURI();
  return metadata.findFirstValue(resourceURI, 'dcterms:description');
};

export const getModifiedDate = entry => entry.getEntryInfo().getModificationDate();
export const getThemeLabels = entry => getChoiceLabels(entry, 'dcat:theme', 'dcat:theme-isa');

export const getParentCatalogEntry = entry => registry.get('entrystoreutil')
  .getEntryByType('dcat:Catalog', entry.getContext());

export const getContributors = (entry) => {
  const es = registry.get('entrystore');
  const entryInfo = entry.getEntryInfo();
  const contributorsEntryURIs = entryInfo.getContributors()
    .map(contributorURI => es.getEntryURIFromURI(contributorURI));

  return Promise.all(contributorsEntryURIs.map(uri => es.getEntry(uri)));
};

export const getIdeas = (entry, onSuccess) => {
  getSolrQueryResults(entry, 'esterms:Idea', onSuccess);
};

export const getShowcases = (entry, onSuccess) => {
  getSolrQueryResults(entry, 'esterms:Result', onSuccess);
};
