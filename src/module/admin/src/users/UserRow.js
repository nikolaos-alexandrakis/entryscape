import registry from 'commons/registry';
import { terms, types } from 'store';
import EntryRow from 'commons/list/EntryRow';
import ConfirmDialog from 'commons/dialog/ConfirmDialog';
import { template, escape } from 'lodash-es';
import declare from 'dojo/_base/declare';

export default declare([EntryRow], {
  /**
   * @deprecated use corresponding method installActionOrNot.
   */
  installButtonOrNot() {
    const id = this.entry.getId();
    if (id === '_guest' || id === '_admin') {
      return 'disabled';
    }
    return this.inherited(arguments);
  },

  installActionOrNot(params) {
    const { name } = params;
    const id = this.entry.getId();
    if (id === '_guest' || id === '_admin') {
      switch (name) {
        case 'remove':
        case 'customProperties':
        case 'statusEnable':
        case 'statusDisable':
          return 'disabled';
        default:
          break;
      }
    }

    // don't install 'status' action if current user cannot administer
    // the row user or current = row
    if (name === 'statusEnable' || name === 'statusDisable') {
      const currentUserId = registry.get('userEntry').getId();
      if (!this.entry.canAdministerEntry() || this.entry.getId() === currentUserId) {
        return false;
      }

      const isUserDisabled = this.getIsUserDisabled();
      if ((isUserDisabled && name === 'statusDisable') || (!isUserDisabled && name === 'statusEnable')) {
        return false;
      }
    }

    return this.inherited(arguments);
  },
  getRenderNameHTML() {
    const isUserDisabled = this.getIsUserDisabled();
    const name = `${this.getRenderName()} ${isUserDisabled ? this.getDisabledUserHtml() : ''}`;
    const href = this.getRowClickLink() || this.list.getRowClickLink(this);
    if (href) {
      return `<a href="${href}">${name}</a>`;
    }
    return name;
  },
  getRenderName() {
    const username = this.entry.getEntryInfo().getName() || (this.entry.getResource(true)
      && this.entry.getResource(true).getName());
    const rdfutils = registry.get('rdfutils');
    const name = rdfutils.getLabel(this.entry);
    if (name == null && username == null) {
      return template(this.nlsSpecificBundle.unnamedUser)({ id: this.entry.getId() });
    }

    return `${escape(username)}  -  ${escape(name)}`;
  },
  action_remove() {
    const entry = this.entry;
    const es = entry.getEntryStore();
    const dialogs = registry.get('dialogs');
    const bundle = this.nlsSpecificBundle;
    const name = this.getRenderName();

    let soleUserMsg = null;// fix for ESAD-5
    // Check if there are any solely owned non-homecontexts.
    es.newSolrQuery().graphType(types.GT_CONTEXT).admin(entry.getResourceURI()).limit(100)
      .getEntries(0)
      .then((ownedContextEntries = []) => {
        // Check if many solely owned entries.
        if (ownedContextEntries.some((oce) => {
          // If solely owned.
          if (oce.getEntryInfo().getACL().admin.length === 1) {
            // Ignore homecontexts since they will be checked later.
            const homeContextOf = oce.getReferrers(terms.homeContext);
            if (homeContextOf.indexOf(entry.getResourceURI()) === -1) {
              return true;
            }
          }
          return false; // Not solely owned or homecontext.
        })) {
          soleUserMsg = template(bundle.warningSoleOwner)({ name });
        }
      })
      .then(() => {
        // fix for ESAD-5
        let msg = template(bundle.remove)({ name });
        if (soleUserMsg) {
          msg = `${soleUserMsg}<br><br>${template(bundle.remove)({ name })}`;
        }
        return dialogs.confirm(msg, bundle.confirmRemove, bundle.cancelRemove);
      })
      .then(() => // Proceed to remove user
        // Third, check if we should remove solely owned homecontext as well.
        entry.getResource().then((ures) => {
          const hcId = ures.getHomeContext();
          if (hcId) {
            const hcontext = es.getContextById(hcId);
            const res = hcontext.getEntry();
            return res.then((hcEntry) => {
              const refs = hcEntry.getReferrers(terms.homeContext);
              if (refs.length === 1 && refs[0] === entry.getResourceURI()) {
                return dialogs.confirm(bundle.removeHomecontext,
                  bundle.confirmRemoveHomecontext,
                  bundle.cancelRemoveHomecontext)
                  .then(() => {
                    hcEntry.del();
                    return entry.del();
                  }, () => {
                    const d = entry.del();
                    hcEntry.setRefreshNeeded();
                    hcEntry.refresh();
                    return d;
                  });
              }
              return entry.del();
            });
          }
          return entry.del();
        }).then(() => {
          this.list.getView().removeRow(this);
          this.destroy();
        }, err => dialogs.acknowledge(template(bundle.failedRemove)({ error: err || '' }))));
  },
  action_statusEnable() {
    this.changeStatus();
  },
  action_statusDisable() {
    this.changeStatus();
  },
  changeStatus() {
    const isUserDisabled = this.getIsUserDisabled();
    const message = isUserDisabled ? this.nlsSpecificBundle.userStatusEnableConfirmation :
      this.nlsSpecificBundle.userStatusDisableConfirmation;
    const yes = this.nlsSpecificBundle.userStatusChangeConfirm;
    const no = this.nlsSpecificBundle.userStatusChangeCancel;

    new ConfirmDialog().show(message, yes, no, async (isConfirmed) => {
      if (isConfirmed) {
        // change user status
        const res = await this.entry.getResource();
        await res.setDisabled(!isUserDisabled);
        this.reRender();
      }
    });
  },
  getIsUserDisabled() {
    const currentUserId = registry.get('userEntry').getId();
    if (this.entry.getId() === currentUserId) {
      return false;
    }

    return this.entry.getEntryInfo().isDisabled();
  },
  getDisabledUserHtml() {
    return `<i style="margin-left:10px"  rel="tooltip" title="${this.nlsSpecificBundle.userStatusDisabled}" 
            class="fas fa-user-times"></i>`;
  },
});
