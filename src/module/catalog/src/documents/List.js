import List from 'workbench/bench/List';
import typeIndex from 'commons/create/typeIndex';
import escoList from 'commons/nls/escoList.nls';
import escaDocuments from 'catalog/nls/escaDocuments.nls';
import declare from 'dojo/_base/declare';

export default declare([List], {
  nlsBundles: [{escoList}, {escaDocuments}],
  nlsRemoveEntryConfirm: 'confirmDocumentRemove',
  includeMassOperations: false,
  rowActionNames: ['edit', 'replace', 'download', 'remove'],

  constructor() {
    this.benchTypeConf = typeIndex.getConfByName('datasetDocument');
    this.bench = {
      updateBadge: () => {
      },
    };
    this.mode = 'edit';
  },
});
