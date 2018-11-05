import registry from 'commons/registry';
import GCERow from 'commons/gce/GCERow';

import {i18n, NLSMixin} from 'esi18n';


define([
  'dojo/_base/declare',
], (declare) => {
  const getUser = (mail) => {
    const es = registry.get('entrystore');
    return es.getREST().get(`${es.getBaseURI()}_principals?entryname=${mail}`)
      .then((data) => {
        if (data.length > 0) {
          return es.getContextById('_principals').getEntryById(data[0]);
        }
        return false;
      });
  };

  const canRemoveUser = (userEntry, groupEntry) => {
    const pgs = userEntry.getParentGroups();
    const contained = pgs.indexOf(groupEntry.getURI()) !== -1;
    return contained && pgs.length === 1;
  };

  /**
   * This row class is only needed to correctly remove associated user
   * if the user doing the deletion is in the admin-group.
   */
  return declare([GCERow], {
    removeRow(p) {
      const row = this;
      return p.then(() => {
        row.list.getView().removeRow(row);
        row.destroy();
        const ue = registry.get('userEntry');
        ue.setRefreshNeeded();
        ue.refresh();
      }, () => {
        registry.get('dialogs').acknowledge(row.nlsGenericBundle[row.nlsRemoveFailedKey]);
      });
    },

    action_remove() {
      const context = this.getContext();
      const md = this.entry.getMetadata();
      const ruri = this.entry.getResourceURI();
      const mailto = md.findFirstValue(ruri, 'foaf:mbox');
      const mail = mailto ? mailto.substr(7) : null;
      const dialogs = registry.get('dialogs');
      const removeRow = this.removeRow.bind(this);
      const bundle = this.nlsSpecificBundle;

      const confirmRemoveGCU = () => {
        const message = i18n.renderNLSTemplate(bundle.confirmRemovePipelineAndUser, mail);
        return dialogs.confirm(message, null, null);
      };
      const confirmRemoveGC = () => dialogs.confirm(bundle.confirmRemovePipeline, null, null);

      registry.get('getGroupWithHomeContext')(this.getContext()).then((groupEntry) => {
        const removeGC = () => removeRow(context.getEntry()
          .then(hcEntry => hcEntry.del()).then(() => groupEntry.del()));
        const noop = () => {
        };
        const ui = registry.get('userInfo');
        if (mail && ui.user !== mail && registry.get('hasAdminRights')) {
          getUser(mail).then((userEntry) => {
            if (userEntry && canRemoveUser(userEntry, groupEntry)) {
              confirmRemoveGCU().then(() => {
                userEntry.del().then(removeGC);
              }, noop);
            } else {
              confirmRemoveGC().then(removeGC).then(() => {
                if (userEntry) {
                  userEntry.setRefreshNeeded();
                  userEntry.refresh();
                }
              }, noop);
            }
          });
        } else {
          confirmRemoveGC().then(removeGC, noop);
        }
      });
    },
  });
});
