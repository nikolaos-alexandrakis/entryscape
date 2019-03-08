import registry from 'commons/registry';

// UTILS
const getChoiceLabels = (entry, property, choiceTemplateId) => {
  const choices = registry.get('itemstore').getItem(choiceTemplateId).getChoices();

  return entry.getMetadata().find(entry.getResourceURI(), property)
    .map(statement => statement.getValue())
    .map(uri => choices.find(choice => choice.value === uri) )
    .map(choice => registry.get('localize')(choice.label));
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

export const getModifiedDate = entry => entry.getEntryInfo().getModificationDate();
export const getThemeLabels = (entry) => getChoiceLabels(entry, 'dcat:theme', 'dcat:theme-isa');
