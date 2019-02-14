import escaDocuments from 'catalog/nls/escaDocuments.nls';
import typeIndex from 'commons/create/typeIndex';
import escoList from 'commons/nls/escoList.nls';
import config from 'config';
import declare from 'dojo/_base/declare';
import List from 'workbench/bench/List';

export default declare([List], {
  nlsBundles: [{ escoList }, { escaDocuments }],
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
    this.includeSizeByDefault = config.get('catalog.includeListSizeByDefault', false);
  },
});
