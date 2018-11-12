import registry from 'commons/registry';
import ToggleRow from 'commons/list/common/ToggleRow';
import { template } from 'lodash-es';
import declare from 'dojo/_base/declare';

export default declare([ToggleRow], {
  nlsPublicTitle: 'publicFileTitle',
  nlsProtectedTitle: 'privateFileTitle',
  includeInfoButton: false,
  includeEditButton: true,
  includeRemoveButton: true,
  postCreate() {
    this.inherited('postCreate', arguments);
    this.entry.getContext().getEntry().then((contextEntry) => {
      this.setToggled(contextEntry.isPublic(), this.entry.isPublic());
    });
  },

  getRenderName() {
    let name = this.inherited('getRenderName', arguments);
    if (typeof name === 'undefined') {
      const graph = this.entry.getEntryInfo().getGraph();
      const ns = registry.get('namespaces');
      name = graph.findFirstValue(this.entry.getResourceURI(), ns.expand('rdfs:label'));
    }
    return name || this.entry.getId();
  },

  toggleImpl(onSuccess) {
    const ei = this.entry.getEntryInfo();
    const acl = ei.getACL(true);
    registry.get('getGroupWithHomeContext')(this.entry.getContext()).then((groupEntry) => {
      if (this.isPublicToggle) {
        acl.admin = acl.admin || [];
        acl.admin.push(groupEntry.getId());
        ei.setACL(acl);
        ei.commit().then(onSuccess);
      } else {
        ei.setACL({});
        ei.commit().then(onSuccess);
      }
    });
  },

  action_remove() {
    const dialogs = registry.get('dialogs');
    const self = this;
    const name = this.getRenderName();
    const ns = registry.get('namespaces');
    const inDataset = this.entry.getReferrers(ns.expand('dcat:downloadURL'));
    const apiConnected = this.entry.getReferrers(ns.expand('store:pipelineData'));

    if (inDataset.length || apiConnected.length > 0) {
      dialogs.acknowledge(
        template(this.nlsSpecificBundle.cannotRemoveFile)({ file: name }));
      return;
    }

    dialogs.confirm(template(this.nlsSpecificBundle.removeFile)({ file: name }), null, null,
      (confirm) => {
        if (!confirm) {
          return;
        }
        self.entry.del().then(() => {
          self.list.getView().removeRow(self);
          self.destroy();
        }, () => {
          dialogs.acknowledge(template(self.nlsSpecificBundle.removeFailed)({ file: name }));
        });
      });
  },
});
