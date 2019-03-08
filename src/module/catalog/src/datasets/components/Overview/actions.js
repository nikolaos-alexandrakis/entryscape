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
    const toggleThisImplementation = () => {
      const ns = registry.get('namespaces');
      const ei = entry.getEntryInfo();
      const dialogs = registry.get('dialogs');
      registry.get('getGroupWithHomeContext')(entry.getContext()).then((groupEntry) => {
        if (groupEntry.canAdministerEntry()) {
          if (this.isPublicToggle) { // @scazan THIS
            const apiDistributionURIs = [];
            const esu = registry.get('entrystoreutil');
            const stmts = this.getDistributionStatements(); // @scazan THIS
            Promise.all(stmts.forEach((stmt) => {
              const ruri = stmt.getValue();
              esu.getEntryByResourceURI(ruri).then((distEntry) => {
                const source = distEntry.getMetadata()
                  .findFirstValue(distEntry.getResourceURI(), ns.expand('dcterms:source'));
                if (source !== '' && source != null) {
                  apiDistributionURIs.push(source);
                }
              }, () => {
              }); // fail silently
            }));
            if (apiDistributionURIs.length === 0) {
              return this.unpublishDataset(groupEntry, onSuccess); // @scazan THIS
            }
            const confirmMessage = this.nlsSpecificBundle[this.list.nlsApiExistsToUnpublishDataset]; // @scazan THIS
            return dialogs.confirm(confirmMessage, null, null, (confirm) => {
              if (confirm) {
                return this.unpublishDataset(groupEntry, onSuccess); // @scazan THIS
              }
              return null;
            });
          }

          ei.setACL({});
          // this.reRender();
          ei.commit().then(onSuccess);
          this.updateDistributionACL({}); // @scazan THIS
        } else {
          registry.get('dialogs').acknowledge(this.nlsSpecificBundle.datasetSharingNoAccess); // @scazan THIS
        }
      });
    };

    if (this.isPublicToggle) { // @scazan THIS
      const es = registry.get('entrystore');
      const adminRights = registry.get('hasAdminRights');
      const userEntry = registry.get('userEntry');
      const ccg = config.catalog.unpublishDatasetAllowedFor;
      const allowed = ccg === '_users' ? true :
        userEntry.getParentGroups().indexOf(es.getEntryURI('_principals', ccg)) >= 0;
      if (!adminRights && !allowed) {
        registry.get('dialogs').acknowledge(this.nlsSpecificBundle.unpublishProhibited); // @scazan THIS
        return;
      }
    } else if (entry.getMetadata().find(null, 'dcat:distribution').length === 0) {
      const nls = this.nlsSpecificBundle; // @scazan THIS
      registry.get('dialogs').confirm(
        nls.confirmPublishWithoutDistributions,
        nls.proceedPublishWithoutDistributions,
        nls.cancelPublishWithoutDistributions,
      ).then(toggleThisImplementation);

      return;
    }

    toggleThisImplementation();
  };

  return {
    openEditDialog,
    unpublishDataset,
    toggleImplementation,
  };
};
