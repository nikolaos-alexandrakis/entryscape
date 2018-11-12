import registry from 'commons/registry';
import { types } from 'store';
import TypeaheadList from 'commons/list/common/TypeaheadList';
import TitleDialog from 'commons/dialog/TitleDialog';
import htmlUtil from 'commons/util/htmlUtil';
import ListDialogMixin from 'commons/list/common/ListDialogMixin';
import { NLSMixin } from 'esi18n';
import esadGroup from 'admin/nls/esadGroup.nls';
import escoList from 'commons/nls/escoList.nls';
import declare from 'dojo/_base/declare';

import RoleRow from './RoleRow';

const RemoveDialog = declare([], {
  constructor(params) {
    this.list = params.list;
  },
  open(params) {
    const self = this;
    const grpEntry = this.list.entry;
    const grpEntryInfo = grpEntry.getEntryInfo();
    if (grpEntryInfo.getACL().admin.indexOf(params.row.entry.getResourceURI()) !== -1) {
      // manager
      const dialogs = registry.get('dialogs');
      dialogs.acknowledge(this.list.nlsSpecificBundle.removeManager);
    } else {
      this.list.entry.getResource(true).removeEntry(params.row.entry)
        .then(() => {
          self.list.getView().removeRow(params.row);
          params.row.destroy();
          params.row.entry.setRefreshNeeded();
          params.row.entry.refresh();
        });
    }
  },
});

const MemberList = declare([TypeaheadList], {
  nlsBundles: [{ escoList }, { esadGroup }],
  includeInfoButton: true,
  includeCreateButton: false,
  includeEditButton: false,
  includeRemoveButton: true,
  includeResultSize: false,
  rowClass: RoleRow,
  nlsEmptyListWarningKey: 'emptyMessageMembers',

  postCreate() {
    this.inherited('postCreate', arguments);
    this.registerDialog('remove', RemoveDialog); // Overrides the removeDialog from BaseList.
    this.getView().domNode.classList.remove('container');
    this.listView.includeResultSize = !!this.includeResultSize; // make this boolean
  },
  installButtonOrNot(params /* ,row */) {
    // eslint-disable-next-line
    switch (params.name) {
      case 'remove':
        return this.entry.canWriteResource();
    }
    return this.inherited(arguments);
  },
  getTemplate() {
    if (!this.template) {
      this.template = registry.get('itemstore').getItem('esc:User');
    }
    return this.template;
  },

  typeahead_getQuery(str) {
    return this.entry.getEntryStore().newSolrQuery().graphType(types.GT_USER)
      .title(str)
      .limit(10)
      .list();
  },

  typeahead_select(entry) {
    this.entry.getResource(true).addEntry(entry).then(() => {
      entry.setRefreshNeeded();
      entry.refresh();
    });
    this.inherited(arguments);
  },

  typeahead_processEntries(entries, callback) {
    const self = this;
    return this.entry.getResource(true).getAllEntryIds().then((entryIds) => {
      const filtEntries = entries.filter(e =>
        (entryIds.indexOf(e.getId()) === -1 && e.getId() !== '_admin'));
      callback(filtEntries.map(entry => ({
        id: entry.getURI(),
        name: self.typeahead.getLabel(entry),
      })));
    });
  },

  search() {
    this.listView.showEntryList(this.entry.getResource(true));
  },
});

const MemberDialog = declare([TitleDialog, ListDialogMixin, NLSMixin.Dijit], {
  nlsBundles: [{ esadGroup }],
  nlsHeaderTitle: 'memberHeader',
  nlsFooterButtonLabel: 'memberDoneButton',
  maxWidth: 800,

  postCreate() {
    this.inherited(arguments);
    this.nonMemberInfoMsg = htmlUtil.create('span', null, this.containerNode);
    this.nonMemberInfoMsg.style.display = 'none';
    this.memberList = new MemberList({}, htmlUtil.create('div', null, this.containerNode));
  },

  open(params) {
    this.inherited(arguments);
    this.showEntry(params.row.entry);
  },
  showNonMemberInfoMsg(disabled) {
    if (disabled) {
      this.nonMemberInfoMsg.style.display = 'block';
    }
  },
  showEntry(entry) {
    this.memberList.entry = entry;
    this.memberList.typeahead.setDisabled(!entry.canWriteResource());
    this.showNonMemberInfoMsg(!entry.canWriteResource());
    this.memberList.render();
    this.nonMemberInfoMsg.innerHTML = this.NLSBundles.esadGroup.nonMemberInfoMsg;
    this.updateLocaleStrings(esadGroup, {
      group: registry.get('rdfutils').getLabel(entry) || entry.getId(),
    });
    this.show();
  },
});

/**
 * Can be registered as a dialog in entryscape-commons/gce/list, i.e.:
 *  this.registerDialog("openMemberDialog", MemberDialog.ListDialog);
 *
 *  Requires that the gce-list yields a unique group per row. If it fails
 *  an error message is shown assuming the nls key specified by the attribute
 *  'nlsGroupSharingProblem' yields a sensible value in the lists nlsSpecificBundle.
 */
MemberDialog.ListDialog = declare([ListDialogMixin], {
  constructor(params, node) {
    this.dialog = new MemberDialog({}, node);
  },
  open(params) {
    this.inherited(arguments);
    const ns = registry.get('namespaces');
    const contextEntry = params.row.getContext().getEntry(true);
    const refs = contextEntry.getReferrers(ns.expand('store:homeContext'));
    if (refs.length === 1) {
      const es = registry.get('entrystore');
      es.getEntry(es.getEntryURIFromURI(refs[0])).then((groupEntry) => {
        this.dialog.showEntry(groupEntry);
      });
    } else {
      const bundle = this.list.nlsSpecificBundle;
      registry.get('dialogs').acknowledge(
        bundle[this.list.nlsGroupSharingProblem]);
    }
  },
});

export default MemberDialog;
