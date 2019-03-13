import registry from 'commons/registry';
import config from 'config';
import { engine, utils as rdformsUtils } from 'rdforms';

// UTILS
const getChoiceLabels = (entry, property, choiceTemplateId) => {
  const choices = registry.get('itemstore').getItem(choiceTemplateId).getChoices();

  return entry.getMetadata().find(entry.getResourceURI(), property)
    .map(statement => statement.getValue())
    .map(uri => choices.find(choice => choice.value === uri))
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
/**
 * Get all the labels for themes
 *
 * @param  {store/Entry} An Entry
 * @returns {undefined}
 */
export const getThemeLabels = entry => getChoiceLabels(entry, 'dcat:theme', 'dcat:theme-isa');

/**
 * Get the dcat:accessURL property of an entry
 *
 * @param  {store/Entry} An Entry
 * @returns {string}
 */
export const getAccessURI = (entry) => {
  const metadata = entry.getMetadata();
  const resourceURI = entry.getResourceURI();
  return metadata.findFirstValue(resourceURI, registry.get('namespaces').expand('dcat:accessURL'));
};

/**
 * Get the dcat:downloadURL of an entry
 *
 * @param  {store/Entry} An Entry
 * @returns {string}
 */
export const getDownloadURI = (entry) => {
  const metadata = entry.getMetadata();
  const resourceURI = entry.getResourceURI();
  return metadata.findFirstValue(resourceURI, registry.get('namespaces').expand('dcat:downloadURL'));
};


/**
 * Get all file URLs from an entry (dcat:downloadURL)
 *
 * @param  {store/Entry} An Entry
 * @return {string[]}
 */
export const getFileEntries = (entry) => {
  const metadata = entry.getMetadata();
  const resourceURI = entry.getResourceURI();
  return metadata.find(resourceURI, registry.get('namespaces').expand('dcat:downloadURL'));
};

/**
 * Get the file format of a distribution Entry
 *
 * @param {store/Entry} The distribution Entry
 * @returns {string}
 */
export const getDistributionFormat = (entry) => {
  const namespaces = registry.get('namespaces');
  const md = entry.getMetadata();
  const subj = entry.getResourceURI();

  // @scazan WHAT IS TEMPLATE DRIVEN FORMAT?
  let format;
  // Check for template driven format
  const formatTemplate = config.catalog.formatTemplateId
    ? registry
      .get('itemstore')
      .getItem(config.catalog.formatTemplateId)
    : undefined;
  if (formatTemplate) {
    format = rdformsUtils.findFirstValue(engine, md, subj, formatTemplate);
  }
  // Alternatively check for pure value via array of properties
  if (!format && config.catalog.formatProp) {
    const formatPropArr = typeof config.catalog.formatProp === 'string'
      ? [config.catalog.formatProp]
      : config.catalog.formatProp;
    formatPropArr.find((prop) => {
      format = md.findFirstValue(subj, namespaces.expand(prop));
      return format != null;
    });
  }

  return format;
};

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
