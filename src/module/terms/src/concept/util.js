import registry from 'commons/registry';

/**
 *
 * @param entry
 * @return {String}
 */
const isConceptSchemeNamespaced = entry => entry.getMetadata().findFirstValue(null, 'void:uriSpace');

/**
 * TODO @valentino if the inverse relational cache is available for the ConceptScheme then use that instead of the query
 * @param conceptPrefLabel
 * @param {string} conceptSchemeNamespace
 */
const getUniqueConceptRURI = async (conceptPrefLabel, conceptSchemeNamespace) => {
  let conceptCandidateRURI = `${conceptSchemeNamespace}${conceptPrefLabel}`;

  try {
    const entry = await registry.getEntryStoreUtil().getEntryByResourceURI(conceptCandidateRURI);
    if (entry) { // not really needed
      conceptCandidateRURI = `${conceptSchemeNamespace}${conceptPrefLabel}-${Math.floor(Math.random() * Math.floor(100))}`;
    }
  } catch {
    // proceed, no entry found with that resource
  }


  return conceptCandidateRURI;
};

/**
 *
 * @param conceptEntry
 * @param conceptSchemeEntry
 * @param conceptLabel
 * @return {Promise<String|string|*|string>}
 */
const expandConceptLocalName = async (conceptEntry, conceptSchemeEntry, conceptLabel = null) => {
  let conceptRURI;
  const namespace = isConceptSchemeNamespaced(conceptSchemeEntry);
  if (namespace) {
    const conceptName = conceptLabel ||
      conceptEntry.getMetadata().findFirstValue(conceptEntry.getResourceURI(), 'skos:prefLabel');
    conceptRURI = await getUniqueConceptRURI(conceptName, namespace);
  } else {
    return conceptEntry.getResourceURI();
  }

  return conceptRURI;
};

export {
  isConceptSchemeNamespaced,
  expandConceptLocalName,
  getUniqueConceptRURI,
};

