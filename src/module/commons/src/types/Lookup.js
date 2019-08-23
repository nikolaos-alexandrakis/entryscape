/* eslint-disable no-use-before-define */
import config from 'config';
import registry from 'commons/registry';
import EntityType from './EntityType';

let id2ET;

const contextHasETConfig = async context => context.getEntry().then((contextEntry) => {
  const graph = contextEntry.getEntryInfo().getGraph();
  const anyET = graph.findFirstValue(contextEntry.getResourceURI(), 'esterms:entityType');
  // const anyETG = graph.findFirstValue(contextEntry.getResourceURI(), 'esterms:entityType');
  return anyET != null;
});

const _secondary = async (primary, inContext) => {
  if (inContext) {
    const secondaryList = await Lookup.secondaryInContext(entry.getContext());
    return secondaryList.filter(m => m.refines() === primary.id());
  }
  const secondaryAvailableList = await Lookup.availableSecondary();
  return secondaryAvailableList.filter(m => m.refines() === primary.id());
};

const toURI = (name, base) => ((name.indexOf(base) === -1) ? base + name : name);

const Lookup = {
  init() {
    id2ET = {};
    Lookup.import(config.entitytypes);
  },
  normalize(entitytypes) {
    const base = registry.get('entrystore').getResourceURI('entitytypes', '');
    entitytypes.forEach((et) => {
      et.id = toURI(et.name, base);
      if (et.refines) {
        et.refines = toURI(et.refines, base);
      }
      if (et.useWith) {
        et.useWith = toURI(et.useWith, base);
      }
    });
  },
  import(types) {
    Lookup.normalize(types);
    types.forEach((t) => {
      id2ET[t.id] = new EntityType(t);
    });
  },

  async getTemplate(entry, parentEntry) {
    const et = await Lookup.inUse(entry, parentEntry);
    return et.template();
  },

  /**
   * Find the entity type in use for the given entry.
   * Check in order:
   * 1. Entity type explicitly specified to be used in conjunction by entity type for parent entry
   * 2. Entity type specified in the entry information.
   * 3. Matching primary entity type specified on the context (if entity types specified there)
   * 4. Matching primary entity type globally (otherwise)
   *
   * @param entry
   * @param parentEntry
   * @returns {Promise<EntityType>} rejects if no primary entity type found.
   */
  async inUse(entry, parentEntry) {
    if (parentEntry) {
      const parentET = await Lookup.inUse(parentEntry);
      if (parentET) {
        const use = Lookup.useWith(parentET, entry);
        if (use) {
          return use;
        }
      }
    }
    const graph = entry.getEntryInfo().getGraph();
    const etId = graph.findFirstValue(entry.getEntryInfo().getMetadataURI(), 'esterms:entityType');
    if (etId) {
      const et = Lookup.get(etId);
      if (et) {
        return et;
      }
    }
    return Lookup.primary(entry);
  },

  /**
   * Find the entity type (if any) that must be used in combination with the given entity type
   * and also matches the given entry.
   *
   * @param entitytype
   * @param store/Entry
   * @returns {Promise<EntityType>}
   */
  useWith(entitytype, entry) {
    const id = entitytype.id();
    return Object.values(id2ET).find(et => (et.useWith() === id && et.match(entry)));
  },

  /**
   * Find the primary and secondary entity types for the given entry.
   * Check in order:
   * 1. Context specific secondary entity types (if configuration on context level)
   * 2. Available matching secondary entity types(otherwise)
   * @param entry
   * @returns {Promise<{origin: string, primary: EntityType,secondary: EntityType[]}>} secondary is always an array.
   */
  async options(entry, parentEntry) {
    if (parentEntry) {
      const parentET = await Lookup.inUse(parentEntry);
      if (parentET) {
        const primary = Lookup.useWith(parentET, entry);
        if (primary) {
          return {
            origin: 'parent',
            primary,
            secondary: [],
          };
        }
      }
    }
    const inContext = await contextHasETConfig(entry.getContext());
    const primary = await Lookup.primary(entry);
    return {
      origin: inContext ? 'context' : 'global',
      primary,
      secondary: await _secondary(primary, inContext),
    };
  },

  /**
   * Find the primary entity type for the given entry.
   * Check in order:
   * 1. Matching primary entity type specified on the context (if entity types specified there)
   * 2. Matching primary entity type globally (otherwise)
   *
   * @param entry
   * @returns {Promise<EntityType>} rejects if no primary entity type found.
   */
  async primary(entry) {
    const inContext = await contextHasETConfig(entry.getContext());
    if (inContext) {
      const primaryList = await Lookup.primaryInContext(entry.getContext());
      const et = primaryList.find(m => m.match(entry));
      if (et) {
        return et;
      }
      throw new Error(`No primary EntityType found among those specified in context for entry : ${entry.getURI()}`);
    }
    const availablePrimarylist = await Lookup.availablePrimary();
    const et = availablePrimarylist.find(m => m.match(entry));
    if (et) {
      return et;
    }
    throw new Error(`No primary EntityType found globally for entry: ${entry.getURI()}`);
  },

  /**
   * Find the secondary entity types for the given entry.
   * Check in order:
   * 1. Context specific secondary entity types (if configuration on context level)
   * 2. Available matching secondary entity types(otherwise)
   * @param entry
   * @returns {Promise<EntityType[]>} always returns an array, may be of zero length.
   */
  async secondary(entry) {
    const inContext = await contextHasETConfig(entry.getContext());
    const primary = await Lookup.primary(entry);
    return _secondary(primary, inContext);
  },

  /**
   * Find the primary entity types for the given context entry.
   * @param context either a Context instance or a context id
   * @returns {Promise<EntityType[]>}
   */
  async primaryInContext(context) {
    const contextEntry = await context.getEntry();
    const graph = contextEntry.getEntryInfo();
    return graph.find(contextEntry.getResourceURI(), 'esterms:entityType')
      .map(stmt => Lookup.get(stmt.getValue()));
  },

  /**
   * Find the secondary entity types for the given context entry.
   * @param context either a Context instance or a context id
   * @returns {Promise<EntityType[]>}
   */
  async secondaryInContext(context) {
    const contextEntry = await context.getEntry();
    const graph = contextEntry.getEntryInfo().getGraph();
    return graph.find(contextEntry.getResourceURI(), 'esterms:secondaryEntityType')
      .map(stmt => Lookup.get(stmt.getValue()));
  },

  /**
   * Find all available entity types.
   * @returns {EntityType[]}
   */
  availablePrimary() {
    return Object.values(id2ET).filter(et => (et.refines() == null && et.useWith() == null));
  },

  /**
   * Find all available entity types.
   * @returns {EntityType[]}
   */
  availableSecondary() {
    return Object.values(id2ET).filter(et => (et.refines() != null && et.useWith() == null));
  },

  /**
   * Find entity types for id.
   * @returns {Promise<EntityType>}
   */
  get(id) {
    return id2ET[id];
  },
};

export default Lookup;
