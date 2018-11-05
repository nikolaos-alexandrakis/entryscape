import ArrayList from 'commons/store/ArrayList';
import {promiseUtil, types} from 'store';
import registry from 'commons/registry';

const es = registry.get('entrystore');

/**
 * A Group-Context-Entry list (GCEList) provides a list of entries corresponding to objects
 * (like data-catalogs and conceptschemes) maintained in separate contexts.
 * Keeping the objects (and all belonging entries) in separate context provides
 * good maintainability and access control. A separate group is also defined per context
 * to allow collaboration. The current user may have access to zero or more of
 * these objects which is detected by checking memberships of groups, checking
 * their home-contexts and then for a corresponding entry in each context.
 */
export default class extends ArrayList {
  constructor(params) {
    super(params);
    this.userEntry = params.userEntry;
    this.entryType = params.entryType;
    this.graphType = params.graphType;
    this.contextType = params.contextType;
    this.term = params.term;
    this.sortOrder = params.sortOrder;
    // this.entryId = params.entryId;
    this.contextId2groupId = {};
  }

  setGroupIdForContext(contextId, groupId) {
    this.contextId2groupId[contextId] = groupId;
  }

  getGroupId(contextId) {
    return this.contextId2groupId[contextId];
  }

  loadEntries() {
    let groupURIs = this.userEntry.getParentGroups();
    groupURIs.push(es.getEntryURI('_principals', '_users'));
    const cids = [];
    groupURIs = groupURIs.map(euri =>
      es.getResourceURI(es.getContextId(euri), es.getEntryId(euri)));
    const query = es.newSolrQuery().title(this.term).graphType(types.GT_CONTEXT)
      .resourceWrite(groupURIs);
    if (this.contextType) {
      query.rdfType(this.contextType);
    }
    if (this.sortOrder === 'title') {
      if (this.entryType != null && this.entryType !== '') {
        // List contains entries, hence when searching for context
        // the title searched against is copied over without language.
        query.sort('title.nolang+desc');
      } else {
        const l = locale.get();
        query.sort(`title.${l}+desc`);
      }
    } else {
      query.sort('modified+asc');
    }
    return query.list().forEach((contextEntry) => {
      // Do additional checks, e.g. really homecontext of one of the parentGroups?
      cids.push(contextEntry.getId());
    }).then(() => this.getEntriesForContextIds(cids));
  }

  extractEntriesFromGroups(groupEntryArr) {
    const hcArr = [];
    groupEntryArr.map((ge) => {
      if (ge != null) {
        const hc = ge.getResource(true).getHomeContext();
        if (hc != null) {
          this.setGroupIdForContext(hc, ge.getId());
          hcArr.push(hc);
        }
      }
    }, this);

    return this.getEntriesForContextIds(hcArr);
  }

  getEntriesForContextIds(cidArr) {
    const getEntryForCid = (cid) => {
      if (this.entryType != null && this.entryType !== '') {
        return registry.get('entrystoreutil').getEntryByType(
          this.entryType, es.getContextById(cid));
      } else if (this.graphType != null && this.graphType !== '') {
        return registry.get('entrystoreutil').getEntryByGraphType(
          this.graphType, es.getContextById(cid));
      }
      return es.getEntry(es.getEntryURI('_contexts', cid));
    };

    this.entries = [];
    return promiseUtil.forEach(cidArr, (cid) => {
      if (cid) {
        return getEntryForCid(cid).then((entry) => {
          this.entries.push(entry);
        }, () => {
        }); // Handle missing entry in context, just ignore to show those that do exist.
      }
      return null;
    }).then(() => this.entries);
  }
};
