import registry from 'commons/registry';
import TitleDialog from 'commons/dialog/TitleDialog';
import ListDialogMixin from 'commons/list/common/ListDialogMixin';
import htmlUtil from 'commons/util/htmlUtil';
import TypeaheadList from 'commons/list/common/TypeaheadList';
import { types } from 'store';
import { NLSMixin } from 'esi18n';
import escoList from 'commons/nls/escoList.nls';
import esadUser from 'admin/nls/esadUser.nls';
import esadGroup from 'admin/nls/esadGroup.nls';
import declare from 'dojo/_base/declare';
// eslint-disable-next-line import/no-named-as-default,import/no-named-as-default-member
import GroupList from './GroupList';

const RemoveDialog = declare([], {
  constructor(params) {
    this.list = params.list;
  },
  open(params) {
    const self = this;
    const user = this.list.entry;
    const group = params.row.entry;
    // check user role in group
    const dialogs = registry.get('dialogs');
    const grpEntryInfo = group.getEntryInfo();
    if (grpEntryInfo.getACL().admin.indexOf(user.getResourceURI()) !== -1) {
      dialogs.confirm(this.list.NLSLocalized.esadGroup.removeGrpWithMgr,
        null, null, (confirm) => {
          if (!confirm) {
            return;
          }
          // remove
          self.removeGroup(params);
        });
    } else {
      self.removeGroup(params);
    }
  },
  removeGroup(params) {
    const self = this;
    const user = this.list.entry;
    const group = params.row.entry;
    group.getResource(true).removeEntry(user)
      .then(() => {
        user.setRefreshNeeded(true);
        user.refresh();
        self.list.getView().removeRow(params.row);
        self.list.groupList.refresh();
        params.row.destroy();
      });
  },
});

const GroupListView = declare([TypeaheadList], {
  nlsBundles: [{ escoList }, { esadUser }, { esadGroup }],
  includeInfoButton: true,
  includeCreateButton: false,
  includeEditButton: false,
  includeRemoveButton: true,
  nlsEmptyListWarningKey: 'emptyMessageGroups',

  postCreate() {
    this.inherited('postCreate', arguments);
    this.registerDialog('remove', RemoveDialog); // Overrides the removeDialog from BaseList.
    this.getView().domNode.classList.remove('container');
    this.listView.includeResultSize = !!this.includeResultSize; // make this boolean
  },

  getTemplate() {
    if (!this.template) {
      this.template = registry.get('itemstore').getItem('esc:Group');
    }
    return this.template;
  },

  typeahead_getQuery(str) {
    return this.entry.getEntryStore().newSolrQuery().graphType(types.GT_GROUP).title(str)
      .limit(10)
      .list();
  },

  typeahead_select(entry) {
    entry.getResource(true).addEntry(this.entry).then(() => {
      this.entry.setRefreshNeeded();
      this.entry.refresh();
      this.groupList.refresh();
    });
    this.inherited(arguments);
  },

  typeahead_processEntries(entries, callback) {
    const self = this;
    const groups = this.entry.getParentGroups();
    const filtEntries = entries.filter(e => groups.indexOf(e.getURI()) === -1);
    callback(filtEntries.map(entry => ({
      id: entry.getURI(),
      name: self.typeahead.getLabel(entry),
    })));
  },

  search(/* params */) {
    if (this.groupList == null || this.entry !== this.groupList.userEntry) {
      this.groupList = new GroupList(this.entry);
    }
    this.getView().showEntryList(this.groupList);
  },
});

export default declare([TitleDialog, ListDialogMixin, NLSMixin.Dijit], {
  nlsBundles: [{ esadUser }],
  nlsHeaderTitle: 'groupHeader',
  nlsFooterButtonLabel: 'groupDoneButton',
  maxWidth: 800,

  postCreate() {
    this.inherited(arguments);
    this.groupList = new GroupListView({}, htmlUtil.create('div', null, this.containerNode));
  },

  open(params) {
    this.inherited(arguments);
    this.entry = params.row.entry;
    this.groupList.entry = params.row.entry;
    this.groupList.render();
    this.updateLocaleStrings(this.NLSLocalized0, {
      user: registry.get('rdfutils').getLabel(this.entry) || this.entry.getId(),
    });
    this.show();
  },
});
