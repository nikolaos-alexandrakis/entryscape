import registry from 'commons/registry';
import ToggleRow from 'commons/list/common/ToggleRow';
import declare from 'dojo/_base/declare';

const dialogs = registry.get('dialogs');

export default declare([ToggleRow], {
  nlsPublicTitle: '',
  nlsProtectedTitle: '',
  nlsContextSharingNoAccess: '',
  nlsConfirmRemoveRow: '',

  postCreate() {
    this.inherited('postCreate', arguments);
    this.nlsPublicTitle = this.list.nlsGCEPublicTitle;
    this.nlsProtectedTitle = this.list.nlsGCEProtectedTitle;
    this.nlsContextSharingNoAccess = this.list.nlsGCESharingNoAccess;
    this.nlsConfirmRemoveRow = this.list.nlsGCEConfirmRemoveRow;
    this.getContext().getEntry().then((contextEntry) => {
      this.setToggled(true, contextEntry.isPublic());
    });
  },

  getContext() {
    return this.list.entriesAreContextEntries ?
      this.entry.getResource(true) : this.entry.getContext();
  },

  installButtonOrNot(params) {
    if (params.name === 'remove' && !registry.get('hasAdminRights')) {
      const es = registry.get('entrystore');
      const cid = this.getContext().getId();
      const guri = es.getEntryURI('_principals', this.list.entryList.getGroupId(cid));
      // Works since GCEList has already loaded all relevant groups.
      const groupEntry = es.getEntry(guri, { direct: true });
      return groupEntry.canAdministerEntry();
    }
    return this.inherited(arguments);
  },

  toggleImpl(onSuccess) {
    const co = this.getContext();
    const es = co.getEntryStore();
    es.getEntry(co.getEntryURI(), { forceLoad: true })
      .then((contextEntry) => {
        if (!contextEntry.canAdministerEntry()) {
          dialogs.acknowledge(this.nlsSpecificBundle[this.nlsContextSharingNoAccess]);
          return;
        }
        let ei;
        let acl;
        if (this.isPublicToggle) {
          ei = contextEntry.getEntryInfo();
          acl = ei.getACL(true);
          acl.rread = acl.rread || [];
          acl.rread.splice(acl.rread.indexOf('_guest'), 1);
          ei.setACL(acl);
          ei.commit().then(onSuccess);
        } else {
          ei = contextEntry.getEntryInfo();
          acl = ei.getACL(true);
          acl.rread = acl.rread || [];
          acl.rread.push('_guest');
          ei.setACL(acl);
          ei.commit().then(onSuccess);
        }
      });
  },

  getRenderNameHTML() {
    const sm = registry.getSiteManager();
    const params = {
      context: this.getContext().getId(),
    };
    const path = sm.getViewPath(this.list.rowClickView, params);
    return `<a onclick='' href='${path}'>${this.getRenderName()}</a>`;
  },
  getRenderName() {
    return this.inherited(arguments) || this.entry.getId();
  },

  action_remove() {
    registry.get('getGroupWithHomeContext')(this.getContext())
      .then((group) => {
        dialogs.confirm(this.nlsSpecificBundle[this.nlsConfirmRemoveRow],
          null, null, (confirm) => {
            if (!confirm) {
              return;
            }
            this.getContext().getEntry()
              .then(hcEntry => hcEntry.del())
              .then(() => group.del())
              .then(() => {
                this.list.getView().removeRow(this);
                this.destroy();
                const ue = registry.get('userEntry');
                ue.setRefreshNeeded();
                ue.refresh();
              },
              () => {
                dialogs.acknowledge(this.nlsGenericBundle[this.nlsRemoveFailedKey]);
              });
          });
      });
  },
});
