import registry from '../registry';
import jquery from 'jquery';

const esu = registry.get('entrystoreutil');

const failureAsNull = promise => promise.then(success => success, () => null);

const filterOutNulls = arr => arr.filter(obj => obj != null);

const getEntryFromResourceURI = (uri, context) => {
  const cache = context.getEntryStore().getCache();
  let arr = cache.getByResourceURI(uri);
  arr = arr.filter(e => e.getContext() === context);
  if (arr.length > 0) {
    return arr[0];
  }

  return null;
};

/**
 *
 * @param refs
 * @param context
 * @returns {Array} Array of entries or []
 */
const getChildrenFromCache = (refs, context) => {
  const arr = [];

  // check if getEntryFromResourceURI can return an entry for each of the refs
  const allRefsInCache = refs.every((ref) => {
    const entry = getEntryFromResourceURI(ref, context);
    if (entry !== null) {
      arr.push(entry);
      return true;
    }
    return false;
  });

  if (allRefsInCache) {
    return arr;
  }

  return [];
};

export default class TreeModel {
  constructor(params) {
    this.explicitInverse = true;
    this.toRootProperty = null;
    this.fromRootProperty = null;
    this.toChildProperty = [];
    this.toParentProperty = [];
    this.membershipToRootProperty = '';

    this.uri2node = {};
    if (typeof params.explicitInverse === 'boolean') {
      this.explicitInverse = params.explicitInverse;
    }
    this.membershipToRootProperty = params.membershipToRootProperty || '';
    this.toParentProperty = Array.isArray(params.toParentProperty)
      ? params.toParentProperty : [params.toParentProperty];
    if (params.toRootProperty) {
      this.toParentProperty.push(params.toRootProperty);
    }
    this.toRootProperty = params.toRootProperty || this.toParentProperty[0];

    if (this.explicitInverse) {
      this.toChildProperty = Array.isArray(params.toChildProperty)
        ? params.toChildProperty : [params.toChildProperty];
      if (params.fromRootProperty) {
        this.toChildProperty.push(params.fromRootProperty);
      }
      this.fromRootProperty = params.fromRootProperty || this.toChildProperty[0];
    }
    this.rootEntry = params.rootEntry;
    if (params.jsTreeConf) {
      this.initJsTreeConf(params.jsTreeConf, params.domNode);
    }

    this.isModelConsistent = true;
  }

  initJsTreeConf(jsTreeConf, domNode) {
    this.domNode = domNode;
    jsTreeConf.core.data = this.getChildren.bind(this);

    import(/* webpackChunkName: "jstree" */ 'jstree')
      .then(() => {
        jquery(domNode).jstree(jsTreeConf);
        jquery(domNode).on('move_node.jstree', this.jsTreeMove.bind(this));
      });
  }

  destroy() {
    if (this.domNode) {
      $(this.domNode).jstree('destroy');
    }
  }

  refresh(entry) {
    if (entry) {
      delete this.uri2node[entry.getResourceURI()];
    } else {
      this.uri2node = {};
    }
  }

  getRootNode() {
    return this.getOrCreateNode(this.rootEntry);
  }

  getOrCreateNode(entry) {
    return this.getNode(entry) || this.createNode(entry);
  }

  isRoot(nodeOrEntry) {
    if (nodeOrEntry.getResourceURI) {
      return nodeOrEntry === this.rootEntry;
    }
    return nodeOrEntry.id === '#' || nodeOrEntry.id === this.rootEntry.getResourceURI();
  }

  getNode(entry) {
    if (entry === this.rootEntry) {
      return {id: '#'};
    }
    return this.uri2node[entry.getResourceURI()];
  }

  getNodeFromURI(entryURI) {
    return this.uri2node[entryURI];
  }

  createNode(entry) {
    const uri = entry.getResourceURI();
    const refs = this.getChildrenRefs(entry);
    const node = {
      id: entry === this.rootEntry ? '#' : uri,
      children: refs.length > 0,
      text: this.getText(entry),
    };
    this.uri2node[uri] = node;
    return node;
  }

  getText(entry) {
    return registry.get('rdfutils').getLabel(entry) || entry.getId();
  }

  getEntry(node) {
    const rootEntry = this.rootEntry;
    const p = new Promise((resolve) => {
      const id = typeof node === 'object' ? node.id : node;
      if (id === '#') {
        resolve(rootEntry);
      } else {
        resolve(getEntryFromResourceURI(id, rootEntry.getContext()));
      }
    });

    return p;
  }

  getNodes(entries) {
    const noNullEntries = filterOutNulls(entries);
    const objEntries = this.getObjectEntries(noNullEntries);
    objEntries.sort(this.sortEntries);
    return objEntries.map(objEntry => this.getOrCreateNode(objEntry.entry));
  }

  getChildren(node, cb) {
    const es = this.rootEntry.getEntryStore();
    const getNodes = this.getNodes.bind(this);

    this.getEntry(node).then((entry) => {
      const refs = this.getChildrenRefs(entry);
      const resourceURI = entry.getResourceURI();
      const context = entry.getContext();
      // First check if all children are in the chace...
      const childrenEntries = getChildrenFromCache(refs, context);
      if (childrenEntries.length > 0) {
        this.updateModelConsistency(childrenEntries, refs);
        cb(getNodes(childrenEntries));
      } else {
        const query = es.newSolrQuery().context(context).limit(100);
        if (this.explicitInverse) { // Get all children entries in one search request
          if (this.isRoot(entry)) {
            query.uriProperty(this.toRootProperty, resourceURI);
          } else {
            query.uriProperty(this.toParentProperty[0], resourceURI);
          }
          const childrenEntriesArray = [];
          query.list()
            .forEach((childEntry) => {
              childrenEntriesArray.push(childEntry);
            })
            .then(() => {
              this.updateModelConsistency(childrenEntriesArray, refs);
              return childrenEntriesArray;
            })
            .then(getNodes)
            .then(cb);
        } else {  // No explicit inverse, one request per child
          Promise.all(refs.map(ref => failureAsNull(es.getEntry(ref)))).then(getNodes).then(cb);
        }
      }
    });
  }

  getChildrenRefs(entry) {
    const refs = [];
    const es = this.rootEntry.getEntryStore();
    const md = entry.getMetadata();
    // Check toChild properties directly in entry metadata.
    if (this.explicitInverse) {
      this.toChildProperty.forEach((prop) => {
        const toChildStmts = md.find(entry.getResourceURI(), prop);
        toChildStmts.forEach((stmt) => {
          if (stmt.getType() === 'uri') {
            refs.push(stmt.getValue());
          }
        });
      });
    } else {
      // Check toParent in inverse relational cache, e.g. relations.
      this.toParentProperty.forEach((prop) => {
        entry.getReferrers(prop).forEach((ref) => {
          refs.push(es.getEntryURIFromURI(ref));
        });
      });
    }

    return refs;
  }

  /**
   * For a parent and its children entries, check if all relations are in place
   *
   * @param childrenEntries
   * @param refs
   */
  updateModelConsistency(childrenEntries, refs) {
    let allGood = false;

    // check if the number of entries pointing to a parent is the same as
    // the numbers entries pointed by the parent.
    // this currently works only when explicit inverse is enabled
    // due to the implementation of getChildren and getChildrenRefs

    if (this.explicitInverse) {
      if (refs.length === childrenEntries.length) {
        allGood = childrenEntries
          .every(childEntry => refs.indexOf(childEntry.getResourceURI()) > -1);
      }
    }

    // TODO non explicit inverse

    if (!allGood) {
      this.setModelConsistency(false);
    }
  }

  /**
   * Change consistency flag only if forced or error inconsistency was detected
   *
   * @param isConsistent
   * @param forceChange
   */
  setModelConsistency(isConsistent, forceChange) {
    if (forceChange) {
      this.isModelConsistent = isConsistent;
    } else {
      this.isModelConsistent = isConsistent ? this.isModelConsistent : isConsistent;
    }
  }

  jsTreeMove(e, data) {
    if (this.block) {
      return;
    }
    this.block = true;
    const releaseBlock = () => {
      this.block = false;
    };
    // lyssna på move_node.jstree  data: {node, old_parent, parent, old_position, position}
    this.getEntry(data.node).then(entry =>
      this.move(entry, data.old_parent, data.parent, data.old_position, data.position)
        .then(() => true, () => {
          data.move_node(data.node, data.old_parent, data.old_position);
          return true;
        })).then(releaseBlock);
  }

  move(entry, fromParent, toParent) {
    const fromParent_ = fromParent === '#' ? this.rootEntry.getResourceURI() : fromParent;
    const toParent_ = toParent === '#' ? this.rootEntry.getResourceURI() : toParent;
    const context = entry.getContext();
    const subj = entry.getResourceURI();
    const fromRoot = fromParent_ === this.rootEntry.getResourceURI();
    const toRoot = toParent_ === this.rootEntry.getResourceURI();
    const fromEntry = getEntryFromResourceURI(fromParent_, context);
    const toEntry = getEntryFromResourceURI(toParent_, context);
    if (fromEntry === null || toEntry === null) {
      throw Error('Cannot move entry, from or to entry is not in cache, strange...');
    }

    return this.isMoveAllowed(entry, fromEntry, toEntry).then((moveAllowed) => {
      if (moveAllowed === false) {
        return undefined;
      }
      const md = entry.getMetadata();
      const fmd = fromEntry.getMetadata();
      const tmd = toEntry.getMetadata();

      const inv = this.explicitInverse;

      // Remove from parent
      if (fromRoot) {
        md.findAndRemove(subj, this.toRootProperty, fromParent_);
      } else {
        md.findAndRemove(subj, this.toParentProperty[0], fromParent_);
      }
      // Add to new parent
      if (toRoot) {
        md.add(subj, this.toRootProperty, toParent_);
      } else {
        md.add(subj, this.toParentProperty[0], toParent_);
      }
      if (inv) {
        fmd.findAndRemove(fromParent_,
          fromRoot ? this.fromRootProperty : this.toChildProperty[0], subj);
        tmd.add(toParent_, toRoot ? this.fromRootProperty : this.toChildProperty[0], subj);
      }

      return entry.commitMetadata().then(() => {
        if (inv) {
          return Promise.all([fromEntry.commitMetadata(), toEntry.commitMetadata()]);
        }
        fromEntry.setRefreshNeeded();
        toEntry.setRefreshNeeded();
        return Promise.all([fromEntry.refresh(), toEntry.refresh()]);
      });
    });
  }

  isMoveAllowed() {
    // Override me
    return Promise.all([]);
  }

  /*
   * This returns either a Concept or ConceptScheme entry resource URI
   */
  getParentResourceURI(entry) {
    const eRURI = entry.getResourceURI();
    const md = entry.getMetadata();

    return md.findFirstValue(eRURI, this.toParentProperty[0])
      || md.findFirstValue(eRURI, this.toRootProperty);
  }

  deleteEntry(entry) {
    let parentEntry;
    const resourceURI = entry.getResourceURI();

    // delete entry, parent relations and refresh all needed
    if (this.explicitInverse) {
      const parentRURI = this.getParentResourceURI(entry);
      return esu.getEntryByResourceURI(parentRURI).then((pe) => {
        parentEntry = pe;
        return entry.del();
      }).then(() => {
        parentEntry.getMetadata().findAndRemove(null, null, resourceURI);
        return parentEntry.commitMetadata();
      }).then(() => {
        parentEntry.setRefreshNeeded();
        return parentEntry.refresh();
      });
    }

    // TODO get the parent somehow else given that explicitInverse is false
    return new Promise(r => r(true));
  }

  createEntry(protEnt, parentNode, tree) {
    let md = protEnt.getMetadata();
    return this.getEntry(parentNode).then((parentEntry) => {
      const parentResourceURI = parentEntry.getResourceURI();
      const protEntResourceURI = protEnt.getResourceURI();
      const parentIsRoot = this.isRoot(parentEntry);
      const ppred = parentIsRoot ? this.toRootProperty : this.toParentProperty[0];
      if (this.membershipToRootProperty !== '') {
        md.add(
          protEntResourceURI, this.membershipToRootProperty, this.rootEntry.getResourceURI());
      }
      md.add(protEntResourceURI, ppred, parentResourceURI);

      return protEnt.commit().then((newEntry) => {
        const updateTree = () => {
          const newNode = this.createNode(newEntry);
          tree.create_node(parentNode, newNode);
          tree.open_node(parentNode);
          tree.hover_node(newNode);
        };

        if (this.explicitInverse) {
          const cpred = parentIsRoot ? this.fromRootProperty : this.toChildProperty[0];
          md = parentEntry.getMetadata();
          md.add(parentResourceURI, cpred, newEntry.getResourceURI());
          return parentEntry.commitMetadata().then(updateTree);
        }
        parentEntry.setRefreshNeeded();
        return parentEntry.refresh(updateTree);
      });
    });
  }

  sortEntries(objEntryA, objEntryB) {
    const titleA = objEntryA.title.toLowerCase();
    const titleB = objEntryB.title.toLowerCase();
    return titleA > titleB ? 1 : -1;
  }

  getObjectEntries(nonNullEntries) {
    const objEntries = [];
    nonNullEntries.forEach((entry) => {
      objEntries.push({title: this.getText(entry), entry});
    });
    return objEntries;
  }
};
