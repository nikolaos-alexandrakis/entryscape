import m from 'mithril';
import registry from 'commons/registry';
import DOMUtil from 'commons/util/htmlUtil';
import EditDialog from 'catalog/datasets/DatasetEditDialog';

export default (entry, dom) => {
  const editDialog = new EditDialog({ entry }, DOMUtil.create('div', null, dom));
  const openEditDialog = () => {
    editDialog.showEntry(entry, () => {
      entry.refresh().then(() => m.redraw());
    });
  };

  const unpublishDataset = (entryInfo, groupEntry) => {
    const acl = entryInfo.getACL(true);
    acl.admin = acl.admin || [];
    acl.admin.push(groupEntry.getId());
    entryInfo.setACL(acl);
    // this.reRender();
    ei.commit().then(() => m.redraw());
    // this.updateDistributionACL(acl);
  };

  const toggleImplementation = (onSuccess) => {
    /*
    const f = () => {
      const ns = registry.get('namespaces');
      const ei = this.entry.getEntryInfo();
      const dialogs = registry.get('dialogs');
      registry.get('getGroupWithHomeContext')(this.entry.getContext()).then((groupEntry) => {
        if (groupEntry.canAdministerEntry()) {
          if (this.isPublicToggle) {
            const apiDistributionURIs = [];
            const esu = registry.get('entrystoreutil');
            const stmts = this.getDistributionStatements();
            Promise.all(stmts.forEach((stmt) => {
              const ruri = stmt.getValue();
              esu.getEntryByResourceURI(ruri).then((entry) => {
                const source = entry.getMetadata().findFirstValue(entry.getResourceURI(), ns.expand('dcterms:source'));
                if (source !== '' && source != null) {
                  apiDistributionURIs.push(source);
                }
              }, () => {
              }); // fail silently
            }));
            if (apiDistributionURIs.length === 0) {
              return this.unpublishDataset(groupEntry, onSuccess);
            }
            const confirmMessage = this.nlsSpecificBundle[this.list.nlsApiExistsToUnpublishDataset];
            return dialogs.confirm(confirmMessage, null, null, (confirm) => {
              if (confirm) {
                return this.unpublishDataset(groupEntry, onSuccess);
              }
              return null;
            });
          }
          ei.setACL({});
          this.reRender();
          ei.commit().then(onSuccess);
          this.updateDistributionACL({});
        } else {
          registry.get('dialogs').acknowledge(this.nlsSpecificBundle.datasetSharingNoAccess);
        }
      });
    };

    if (this.isPublicToggle) {
      const es = registry.get('entrystore');
      const adminRights = registry.get('hasAdminRights');
      const userEntry = registry.get('userEntry');
      const ccg = config.catalog.unpublishDatasetAllowedFor;
      const allowed = ccg === '_users' ? true :
        userEntry.getParentGroups().indexOf(es.getEntryURI('_principals', ccg)) >= 0;
      if (!adminRights && !allowed) {
        registry.get('dialogs').acknowledge(this.nlsSpecificBundle.unpublishProhibited);
        return;
      }
    } else if (this.entry.getMetadata().find(null, 'dcat:distribution').length === 0) {
      const b = this.nlsSpecificBundle;
      registry.get('dialogs').confirm(
        b.confirmPublishWithoutDistributions,
        b.proceedPublishWithoutDistributions,
        b.cancelPublishWithoutDistributions).then(f);
      return;
    }
    f();
    */
  };

  return {
    openEditDialog,
    unpublishDataset,
  };
};
