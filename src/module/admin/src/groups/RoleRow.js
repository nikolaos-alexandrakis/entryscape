import registry from 'commons/registry';
import DropdownRow from 'commons/list/common/DropdownRow';
import declare from 'dojo/_base/declare';
import './esadRole.css';

export default declare([DropdownRow], {
  postCreate() {
    // register dropdownrow menuitems
    this.registerDropdownItem({
      name: 'manager',
      icon: 'shield-alt',
      iconType: 'fa',
      nlsKey: 'manager',
      nlsKeyTitle: 'managerTitle',
      method: this.manager.bind(this),
    });
    this.registerDropdownItem({
      name: 'member',
      icon: 'user',
      iconType: 'fa',
      nlsKey: 'member',
      nlsKeyTitle: 'memberTitle',
      method: this.member.bind(this),
    });
    const grpEntry = this.list.entry;
    const grpEntryInfo = grpEntry.getEntryInfo();
    const userResourceUri = registry.get('userEntry').getResourceURI();
    if (grpEntryInfo.getACL().admin.indexOf(this.entry.getResourceURI()) === -1) {
      this.isManager = false;
    } else {
      this.isManager = true;
      if (this.entry.getResourceURI() === userResourceUri) {
        this.logged = true;
      }
    }
    if (!grpEntry.canWriteResource() || grpEntry.getId() === '_admins') {
      // domStyle.set(this.col1Node, 'display', 'none');
      this.disableDropdown();
    }
    // set isManager before this, its required installActionOrNot
    this.inherited('postCreate', arguments);
    if (this.isManager) {
      this.setDropdownStatus('manager');
      if (this.logged && !registry.get('hasAdminRights')) {
        this.disableDropdown();
      }
    } else {
      this.setDropdownStatus('member');
    }
  },
  /**
   * @deprecated use corresponding method installActionOrNot.
   */
  installButtonOrNot(params) {
    if (this.isManager && !registry.get('hasAdminRights') && this.logged && params.name === 'remove') {
      return 'disabled';
    }
    if (!this.list.entry.canWriteResource() && params.name === 'remove') {
      return 'disabled';
    }

    return this.inherited(arguments);
  },
  updateDropdown() {
    if (this.isManager) {
      this.enableCurrentMenuItem('member');
    } else {
      this.enableCurrentMenuItem('manager');
    }
  },
  installActionOrNot(params) {
    if (this.isManager && !registry.get('hasAdminRights') && this.logged && params.name === 'remove') {
      return 'disabled';
    }
    if (!this.list.entry.canWriteResource() && params.name === 'remove') {
      return 'disabled';
    }
    return this.inherited(arguments);
  },
  updateLocaleStrings(generic, specific) {
    if (this.isManager && this.logged && !registry.get('hasAdminRights')) {
      this.setDropdownStatusTitle(specific.managerDisabledTitle);
    } else if (this.isManager && this.logged && registry.get('hasAdminRights')) {
      this.setDropdownStatusTitle(specific.specialManagerTitle);
    } else if (this.isManager) {
      this.setDropdownStatusTitle(specific.managerMenuTitle);
    } else {
      this.setDropdownStatusTitle(specific.memberTitle);
    }
    this.inherited('updateLocaleStrings', arguments);
  },
  manager() {
    if (this.isDisabled('manager')) {
      return;
    }
    const es = registry.get('entrystore');
    const grpEntry = this.list.entry;
    grpEntry.setRefreshNeeded();
    grpEntry.refresh().then(() => {
      const grpEntryInfo = grpEntry.getEntryInfo();
      const acl = grpEntryInfo.getACL();
      acl.admin.push(this.entry.getResourceURI());
      grpEntryInfo.setACL(acl);
      grpEntryInfo.commit().then(() => {
        const done = () => {
          this.isManager = true;
          let title = this.list.nlsSpecificBundle.managerMenuTitle;
          if (this.logged && !registry.get('hasAdminRights')) {
            this.disableDropdown();
            title = this.list.nlsSpecificBundle.managerDisabledTitle;
          }
          if (this.logged && registry.get('hasAdminRights')) {
            title = this.list.nlsSpecificBundle.specialManagerTitle;
          }
          this.changeDropdownStatus('manager', title);
          /* this.setDropdownStatus("manager");
           this.setDropdownStatusTitle(title);
           this.enableCurrentMenuItem("member");
           this.disableCurrentMenuItem("manager");
           */
        };
        const hcId = grpEntry.getResource(true).getHomeContext();
        if (typeof hcId !== 'undefined') {
          const homecontext = es.getContextById(hcId);
          homecontext.getEntry().then((hcontextEntry) => {
            const hEntryInfo = hcontextEntry.getEntryInfo();
            const hACL = hEntryInfo.getACL();
            hACL.admin.push(this.entry.getResourceURI());
            hEntryInfo.setACL(hACL);
            hEntryInfo.commit().then(() => {
              done();
            });
          });
        } else {
          done();
        }
      });
    });
  },
  member() {
    if (this.isDisabled('member')) {
      return;
    }
    const es = registry.get('entrystore');
    const grpEntry = this.list.entry;
    grpEntry.setRefreshNeeded();
    grpEntry.refresh().then(() => {
      const grpEntryInfo = grpEntry.getEntryInfo();
      const acl = grpEntryInfo.getACL();
      acl.admin.splice(acl.admin.indexOf(this.entry.getResourceURI()), 1);
      grpEntryInfo.setACL(acl);
      grpEntryInfo.commit().then(() => {
        const hcId = grpEntry.getResource(true).getHomeContext();
        const done = () => {
          this.isManager = false;
          const title = this.list.nlsSpecificBundle.memberTitle;
          this.changeDropdownStatus('member', title);
          /*
           this.setDropdownStatus("member");
           this.setDropdownStatusTitle(title);
           this.enableCurrentMenuItem("manager");
           */
        };
        if (typeof hcId !== 'undefined') {
          const homecontext = es.getContextById(hcId);
          homecontext.getEntry().then((hcontextEntry) => {
            const hEntryInfo = hcontextEntry.getEntryInfo();
            const hACL = hEntryInfo.getACL();
            hACL.admin.splice(hACL.admin.indexOf(this.entry.getResourceURI()), 1);
            hEntryInfo.setACL(hACL);
            hEntryInfo.commit().then(() => {
              done();
            });
          });
        } else {
          done();
        }
      });
    });
  },
});
