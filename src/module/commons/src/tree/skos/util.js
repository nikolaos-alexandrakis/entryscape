import registry from 'commons/registry';

const es = registry.get('entrystore');
const esu = registry.get('entrystoreutil');

const hasExplicitInverse = true;
const checkRelatedConcepts = false; // in case we want to check for related terms before deletion

// SKOS classes

const skosClasses = {
  concept: 'skos:Concept',
  conceptScheme: 'skos:ConceptScheme',
  // ... TODO
};

// SKOS properties

/**
 * SKOS semantic relations are links between SKOS concepts, where the link is inherent
 * in the meaning of the linked concepts.
 */
const semanticRelations = {
  membershipToRootProperty: 'skos:inScheme',
  inScheme: 'skos:inScheme',
  toParentProperty: 'skos:broader',
  toChildProperty: 'skos:narrower',
  toRelatedProperty: 'skos:related',
  toRootProperty: 'skos:topConceptOf',
  fromRootProperty: 'skos:hasTopConcept',
};

/**
 *  These properties are used to state mapping (alignment) links between SKOS concepts in
 *  different concept schemes, where the links are inherent in the meaning of the linked concepts.
 */
const mappingProperties = [
  'skos:closeMatch',
  'skos:exactMatch',
  'skos:broadMatch',
  'skos:narrowMatch',
  'skos:relatedMatch',
];

const otherProperties = {
  prefLabel: 'skos:prefLabel',
};

/*
 * This returns either a Concept or ConceptScheme entry resource URI
 */
const getParentResourceURI = (e) => {
  const eRURI = e.getResourceURI();
  const md = e.getMetadata();

  return md.findFirstValue(eRURI, semanticRelations.toParentProperty)
    || md.findFirstValue(eRURI, semanticRelations.toRootProperty);
};

/**
 *
 * @param data
 * @return {*}
 */
const addNewConceptStmts = (data) => {
  const { md, conceptRURI, schemeRURI, label, l, isRoot } = data;

  md.add(conceptRURI, 'rdf:type', skosClasses.concept);
  md.add(conceptRURI, semanticRelations.inScheme, schemeRURI);

  if (label) {
    if (l) {
      md.addL(conceptRURI, otherProperties.prefLabel, label, l);
    } else {
      md.add(conceptRURI, otherProperties.prefLabel, label);
    }
  }

  if (isRoot) {
    md.add(conceptRURI, semanticRelations.toRootProperty, schemeRURI);
  }

  return md;
};

const addConceptToConceptScheme = (conceptEntry, schemeEntry) => schemeEntry.refresh().then(() => {
  const schemeMd = schemeEntry.getMetadata();
  const schemeRURI = schemeEntry.getResourceURI();
  schemeMd.add(schemeRURI, semanticRelations.fromRootProperty, conceptEntry.getResourceURI());
  schemeEntry.commitMetadata();
});

/**
 * Utility functions for working with SKOS
 */
const util = {
  getConceptPath(arr, entry) {
    const broaderParentRURI = getParentResourceURI(entry);
    if (broaderParentRURI) {
      return esu.getEntryByResourceURI(broaderParentRURI, entry.getContext())
        .then((broaderEntry) => {
          arr.push(broaderEntry);
          return this.getConceptPath(arr, broaderEntry);
        });
    }
    return Promise.resolve(arr);
  },
  /**
   * Get a Map of all *mapping* relationships incoming to an entry.
   *
   * E.g
   *
   *  Map(<skos:closeMatch>, [entry1, entry2, ...])
   *
   * @param entry Entry's resource URI
   * @return {Promise} Map key: <property>, value: <Array of entries>
   */
  getMappingRelations(entryRURI) {
    const mappedProperties = new Map();
    const loadRelationsPromise = new Promise((resolve) => {
      const queryPromises = [];

      /**
       * Mapping properties + skos:related. The latter should behave the same as a mapping
       * property on on concept removal
       * @type Array
       */
      const mappingRelationProperties = mappingProperties;
      mappingRelationProperties.push(semanticRelations.toRelatedProperty);

      // populate the mappedProperties (Map) with mappings (keys) and entries (values)
      mappingRelationProperties.forEach((mappingProperty) => {
        queryPromises.push(es.newSolrQuery().uriProperty(mappingProperty, entryRURI)
          .list()
          .forEach((mappedEntry) => {
            // update map with mapped entries
            if (mappedEntry.canWriteMetadata()) {
              const entries = mappedProperties.get(mappingProperty) || [];
              entries.push(mappedEntry);
              mappedProperties.set(mappingProperty, entries);
            }
          }));
      });

      // when map loaded with all entries per mapping property then resolve
      Promise.all(queryPromises).then(() => {
        resolve(mappedProperties);
      });
    });

    return loadRelationsPromise;
  },
  /**
   *
   * @param resourceURI
   * @param filteredRelations
   * @return {Promise<Map<string, Array<store/Entry>>>}
   */
  async getSemanticRelations(resourceURI, filteredRelations = []) {
    const semanticMapping = new Map();
    const promises = [];

    /**
     * Check if item is
     * @param semanticRelationProperty
     * @return {arg is Array<any> | boolean}
     */
    const shouldPassFilter = semanticRelationProperty =>
      Array.isArray(filteredRelations) && // it's array
      (!filteredRelations.length || // either empty or
        (filteredRelations.length > 1
          && filteredRelations.includes(semanticRelationProperty)) // not empty but includes property
      );

    Object.keys(semanticRelations).forEach((semanticRelation) => {
      const semanticRelationProperty = semanticRelations[semanticRelation];
      if (shouldPassFilter(semanticRelationProperty)) {
        promises.push(es.newSolrQuery()
          .uriProperty(semanticRelationProperty, resourceURI)
          .list()
          .forEach((mappedEntry) => {
            // update map with mapped entries
            const entries = semanticMapping.get(semanticRelationProperty) || [];
            entries.push(mappedEntry);
            semanticMapping.set(semanticRelationProperty, entries);
          }));
      }
    });

    await Promise.all(promises);

    return semanticMapping;
  },
  deleteConcept(entry) {
    const entryRURI = entry.getResourceURI();
    const parentRURI = getParentResourceURI(entry);

    return esu.getEntryByResourceURI(parentRURI).then((parentEntry) => {
      if (parentEntry) {
        if (hasExplicitInverse) {
          parentEntry.getMetadata().findAndRemove(null, null, entryRURI);
          parentEntry.commitMetadata();
        } else {
          parentEntry.setRefreshNeeded();
          parentEntry.refresh();
        }
      } else {
        console.log('Something went wrong. No parent entry found for Concept.');
      }

      // delete the entry and the outgoing mapped relations
      return entry.del();
    });
  },
  async updateConceptSchemeRURI(entry, newResourceURI) {
    // update ruri if needed
    const conceptSchemeEntryInfo = entry.getEntryInfo();
    const oldResourceURI = entry.getResourceURI();
    conceptSchemeEntryInfo.setResourceURI(newResourceURI);
    await conceptSchemeEntryInfo.commit();

    const semanticMapping = await util.getSemanticRelations(oldResourceURI, ['skos:inScheme', 'skos:topConceptOf']);

    semanticMapping.forEach((entries, semanticProperty) => {
      entries.forEach((toUpdateEntry) => {
        const entryRURI = toUpdateEntry.getResourceURI();
        const md = toUpdateEntry.getMetadata();

        md.findAndReplaceObject(entryRURI, semanticProperty, oldResourceURI, newResourceURI);

        toUpdateEntry.setMetadata(md);
        toUpdateEntry.commitMetadata(); // async, no need to await
      });
    });
  },
  /**
   * Update the resource URI for the concept and all links (semantic) referring to that resource URI
   *
   * @param entry
   * @param newResourceURI
   * @return {Promise<void>}
   */
  async updateConceptResourceURI(entry, newResourceURI) {
    const oldResourceURI = entry.getResourceURI();

    const entryInfo = entry.getEntryInfo();
    entryInfo.setResourceURI(newResourceURI);
    await entryInfo.commit();

    const semanticMapping = await util.getSemanticRelations(oldResourceURI);

    semanticMapping.forEach((entries, semanticProperty) => {
      entries.forEach((toUpdateEntry) => {
        const md = toUpdateEntry.getMetadata();
        md.findAndReplaceObject(toUpdateEntry.getResourceURI(), semanticProperty, oldResourceURI, newResourceURI);

        toUpdateEntry.setMetadata(md);
        toUpdateEntry.commitMetadata(); // async, no need to await
      });
    });
  },
  hasChildrenOrRelationsConcepts(entry) {
    const md = entry.getMetadata();
    const entryRURI = entry.getResourceURI();
    const children = md.find(entryRURI, semanticRelations.toChildProperty, null);

    if (checkRelatedConcepts) {
      const related = md.find(entryRURI, semanticRelations.toRelatedProperty, null);
      return children.length && related.length;
    }

    return children.length;
  },
  addConceptToScheme(newConcept, conceptScheme = null) {
    if (conceptScheme) {
      return addConceptToConceptScheme(newConcept, conceptScheme);
    }

    const context = registry.get('context');
    return esu.getEntryByType(skosClasses.conceptScheme, context)
      .then(csEntry => addConceptToConceptScheme(newConcept, csEntry), () => {
        throw Error('Concept could not be added to concept scheme');
      });
  },
  getSemanticProperties() {
    return semanticRelations;
  },
  getMappingProperties() {
    return mappingProperties;
  },
  addNewConceptStmts,

};

export default util;
