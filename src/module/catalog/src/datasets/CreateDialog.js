import declare from 'dojo/_base/declare';
import RDFormsEditDialog from 'commons/rdforms/RDFormsEditDialog';
import { withinDatasetLimit } from 'catalog/utils/limit';
import { createEntry } from 'commons/util/storeUtil';
import config from 'config';
import registry from 'commons/registry';
import escaDataset from 'catalog/nls/escaDataset.nls';

// @scazan: This class differs from the class defined in catalog/src/datasets/List.js
// temporarily. Registry needs that file to support the old Datasets view. This file is 
// used in the new datasets view and catalog/src/datasets/List.js should be removed when
// Registry updates to the new view.
export default declare(RDFormsEditDialog, {
  explicitNLS: true,
  maxWidth: 800,
  nlsBundles: [{ escaDataset }],
  open(updateDataset) {
    // if (!withinDatasetLimit(this.list.getView().getSize()) && config.catalog.datasetLimitDialog) {
      // registry.get('dialogs').restriction(config.catalog.datasetLimitDialog);
      // return;
    // }

    this.doneLabel = this.NLSLocalized.escaDataset.createDatasetButton;
    this.title = this.NLSLocalized.escaDataset.createDatasetHeader;
    this.updateTitleAndButton();
    const nds = createEntry(null, 'dcat:Dataset');
    // This following will explicit set ACL to include the group as owner
    // (to make the dataset private by default),
    // well in time before user has filled in metadata and pressed done.
    registry.get('getGroupWithHomeContext')(nds.getContext()).then((groupEntry) => {
      const ei = nds.getEntryInfo();
      const acl = ei.getACL(true);
      acl.admin.push(groupEntry.getId());
      ei.setACL(acl);
    });

    this._newDataset = nds;
    nds.getMetadata().add(
      nds.getResourceURI(), 'rdf:type', 'dcat:Dataset');
    this.show(nds.getResourceURI(), nds.getMetadata(), this.getTemplate());
  },
  getTemplate() {
    return registry.get('itemstore').getItem(
      config.catalog.datasetTemplateId);
  },
  doneAction(graph) {
    return this._newDataset.setMetadata(graph).commit().then((newEntry) => {
      // this.list.getView().addRowForEntry(newEntry);
      return registry.get('entrystoreutil').getEntryByType('dcat:Catalog', newEntry.getContext()).then((catalog) => {
        catalog.getMetadata().add(catalog.getResourceURI(),
          registry.get('namespaces').expand('dcat:dataset'), newEntry.getResourceURI());
        return catalog.commitMetadata().then(() => {
          newEntry.setRefreshNeeded();
          return newEntry.refresh();
        });
      });
    });
  },
});
