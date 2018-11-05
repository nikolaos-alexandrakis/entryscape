import escoList from 'commons/nls/escoList.nls';
import escoAcl from 'commons/nls/escoAcl.nls';
import PrincipalRow from './PrincipalRow';
import ArrayList from '../store/ArrayList';
import TypeaheadList from '../list/common/TypeaheadList';
import {types as esTypes} from 'store';
import declare from 'dojo/_base/declare';


const RemoveDialog = declare(null, {
  constructor(params) {
    this.list = params.list;
  },
  open(params) {
    this.list.principalList.removePrincipal(params.row.entry);
    this.list.getView().removeRow(params.row);
    params.row.destroy();
    this.list.onChange();
  },
});

const PrincipalList = declare([ArrayList], {
  constructor(params) {
    this.entry = params.entry;
    this.focusOnResource = params.focusOnResource;
  },

  addRight(pid, right) {
    if (this.focusOnResource && (right === 'mread' || right === 'mwrite')) {
      return false;
    }
    const prev = this.principalId2Right[pid];
    if (prev == null) {
      this.principalId2Right[pid] = right;
      return true;
    }
    if (right === 'admin' || prev === 'admin') {
      this.principalId2Right[pid] = 'admin';
    } else if (right[0] === 'r' && prev[0] === 'r') {
      this.principalId2Right[pid] = 'rwrite';
    } else if (right[0] === 'm' && prev[0] === 'm') {
      this.principalId2Right[pid] = 'mwrite';
    } else if (right[1] !== prev[1]) {
      switch (right) {
        case 'mread':
        case 'rwrite':
          this.principalId2Right[pid] = 'rwrite_mread';
          break;
        case 'mwrite':
        case 'rread':
          this.principalId2Right[pid] = 'mwrite_rread';
          break;
        default:
      }
    } else if (right === 'mread') {
      this.principalId2Right[pid] = 'read';
    } else {
      this.principalId2Right[pid] = 'write';
    }
    return false;
  },
  loadEntries() {
    const es = this.entry.getEntryStore();
    this.principalId2Right = {};
    const principalPromises = [];
    const acl = this.entry.getEntryInfo().getACL(true);
    let isGuest = false;
    let isUsers = false;

    Object.keys(acl).forEach((right) => {
      const principals = acl[right];
      for (let i = 0; i < principals.length; i++) {
        const pid = principals[i];
        if (this.addRight(pid, right)) {
          if (pid === '_guest') {
            isGuest = true;
          }
          if (pid === '_users') {
            isUsers = true;
          }
          principalPromises.push(es.getEntry(es.getEntryURI('_principals', pid)));
        }
      }
    });

    if (!isGuest) {
      this.addRight('_guest', 'none');
      principalPromises.push(es.getEntry(es.getEntryURI('_principals', '_guest')));
    }
    if (!isUsers) {
      this.addRight('_users', 'none');
      principalPromises.push(es.getEntry(es.getEntryURI('_principals', '_users')));
    }
    return Promise.all(principalPromises).then((principals) => {
      this.entries = principals;
      return principals;
    });
  },

  addPrincipal(principal) {
    this.principalId2Right[principal.getId()] = 'none';
    this.entries.push(principal);
  },

  removePrincipal(principal) {
    delete this.principalId2Right[principal.getId()];
    this.entries.splice(this.entries.indexOf(principal), 1);
  },

  getACL() {
    const p2r = this.principalId2Right;
    const acl = {
      admin: [],
      rread: [],
      rwrite: [],
      mread: [],
      mwrite: [],
    };

    Object.keys(p2r).forEach((id) => {
      const right = p2r[id];
      if (right !== 'none') {
        switch (right) {
          case 'read':
            acl.rread.push(id);
            acl.mread.push(id);
            break;
          case 'write':
            acl.rwrite.push(id);
            acl.mwrite.push(id);
            break;
          case 'mwrite_rread':
            acl.mwrite.push(id);
            acl.rread.push(id);
            break;
          case 'rwrite_mread':
            acl.rwrite.push(id);
            acl.mread.push(id);
            break;
          case 'none':
            break;
          default:
            acl[right].push(id);
        }
      }
    });

    return acl;
  },
});

export default declare([TypeaheadList], {
  nlsBundles: [{escoList}, {escoAcl}],
  includeInfoButton: false,
  includeCreateButton: false,
  includeEditButton: false,
  includeRemoveButton: true,
  includeResultSize: false,
  includeRefreshButton: false,
  includeSortOptions: false,
  rowClass: PrincipalRow,
  isContextACL: false,
  isContextsACL: false,
  isPrincipalsACL: false,
  focusOnResource: false,
  readOnly: false,
  searchInList: false,
  searchVisibleFromStart: false,

  postCreate() {
    this.inherited('postCreate', arguments);
    this.registerDialog('remove', RemoveDialog); // Overrides the removeDialog from BaseList.
    this.listView.includeResultSize = !!this.includeResultSize; // make this boolean
  },

  showStopSign() {
    return false;
  },

  setACLFromEntry(entry) {
    this.isPrincipalsACL = false;
    this.isContextACL = false;
    this.isContextsACL = false;
    if (entry.isContext()) {
      if (entry.getId() === '_contexts') {
        this.isContextsACL = true;
      } else {
        this.isContextACL = true;
      }
    } else if (entry.getId() === '_principals') {
      this.isPrincipalsACL = true;
    }

    this.principalList = new PrincipalList({
      entry,
      focusOnResource: this.focusOnResource,
    });

    this.show();
  },

  getACL() {
    return this.principalList.getACL();
  },

  getRight(pid) {
    return this.principalList.principalId2Right[pid];
  },

  setRight(pid, right) {
    this.principalList.principalId2Right[pid] = right;
    this.onChange();
  },

  typeahead_getQuery(str) {
    return this.principalList.entry.getEntryStore().newSolrQuery()
      .graphType([esTypes.GT_USER, esTypes.GT_GROUP]).title(str)
      .limit(10)
      .list();
  },

  onChange() {
  },

  typeahead_select(entry) {
    this.principalList.addPrincipal(entry);
    this.inherited(arguments);
    this.onChange();
  },

  typeahead_processEntries(entries, callback) {
    const self = this;
    const listedAlready = this.principalList.entries;

    const filtered = entries.filter(e => listedAlready.indexOf(e) === -1);

    callback(filtered.map(entry => ({
      id: entry.getURI(),
      name: self.typeahead.getLabel(entry),
    })));
  },

  search() {
    this.listView.showEntryList(this.principalList);
  },
});
