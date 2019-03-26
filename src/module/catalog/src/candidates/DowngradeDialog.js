import registry from 'commons/registry';
import { NLSMixin } from 'esi18n';
import escaDowngrade from 'catalog/nls/escaDowngrade.nls';
import declare from 'dojo/_base/declare';

export default declare([NLSMixin], {
  nlsBundles: [{ escaDowngrade }],
  constructor() {
    this.initNLS();
  },
  open(params) {
    this.row = params.row;
    this.onDone = params.onDone;
    this.datasetEntry = params.row.entry;
    this.downgrade();
  },
  downgrade() {
    const self = this;
    const bundle = this.NLSBundles.escaDowngrade;
    // check whether published or not
    const dialogs = registry.get('dialogs');
    if (this.datasetEntry.isPublic()) {
      if (bundle) {
        const message = bundle.downgradeFail;
        dialogs.acknowledge(message);
      }
    } else {
      const confirmMessage = bundle.downgradeToCdataset;
      dialogs.confirm(confirmMessage, null, null, (confirm) => {
        if (!confirm) {
          return null;
        }
        self.datasetEntry.getMetadata().findAndRemove(self.datasetEntry.getResourceURI(), 'rdf:type', 'dcat:Dataset');
        self.datasetEntry.getMetadata().add(self.datasetEntry.getResourceURI(), 'rdf:type', 'esterms:CandidateDataset');
        return self.datasetEntry.commitMetadata()
          .then(cDdataset => registry.get('entrystoreutil')
            .getEntryByType('dcat:Catalog', self.datasetEntry.getContext()).then((catalog) => {
              catalog.getMetadata().findAndRemove(catalog.getResourceURI(),
                'dcat:dataset', self.datasetEntry.getResourceURI());
              return catalog.commitMetadata().then(() => {
                self.row.list.getView && self.row.list.getView().removeRow(self.row);
                self.row.destroy && self.row.destroy();
                const returnValue = cDdataset.refresh();
                this.onDone && this.onDone();
                return returnValue;
              });
            }));
      });
    }
  },
});
