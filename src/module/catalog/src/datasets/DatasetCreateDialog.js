import declare from 'dojo/_base/declare';
import { i18n } from 'esi18n';
import registry from 'commons/registry';
import RDFormsEditDialog from 'commons/rdforms/RDFormsEditDialog';
import { withinDatasetLimit } from 'catalog/utils/limit';
import { createEntry } from 'commons/util/storeUtil';
import config from 'config';
import escaDatasetNLS from 'catalog/nls/escaDataset.nls';

export default declare(RDFormsEditDialog, {
  explicitNLS: true,
  maxWidth: 800,
  open(params) {
    if (params.onDone) {
      this.onDone = params.onDone;
    }

    const escaDataset = i18n.getLocalization(escaDatasetNLS);

    if (!withinDatasetLimit(
      this.list && this.list.getView && this.list.getView().getSize(),
    ) && config.catalog.datasetLimitDialog
    ) {
      registry.get('dialogs').restriction(config.catalog.datasetLimitDialog);
      return;
    }

    this.list && this.list.getView && this.list.getView().clearSearch();

    // this.set("doneLabel", this.list.nlsSpecificBundle.createDatasetButton);
    // this.set("title", this.list.nlsSpecificBundle.createDatasetHeader);
    this.doneLabel = escaDataset.createDatasetButton;
    this.title = escaDataset.createDatasetHeader;
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
    this.showEntry(nds);
  },
  doneAction(graph) {
    return this._newDataset.setMetadata(graph).commit().then((newEntry) => {
      this.list && this.list.getView && this.list.getView().addRowForEntry(newEntry);

      return registry.get('entrystoreutil').getEntryByType('dcat:Catalog', newEntry.getContext()).then((catalog) => {
        catalog.getMetadata().add(catalog.getResourceURI(),
          'dcat:dataset', newEntry.getResourceURI());
        return catalog.commitMetadata().then(() => {
          newEntry.setRefreshNeeded();

          this.onDone && this.onDone(newEntry);
          return newEntry.refresh();
        });
      });
    });
  },
});
