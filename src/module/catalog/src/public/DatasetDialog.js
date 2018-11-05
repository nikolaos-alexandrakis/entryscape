import TitleDialog from 'commons/dialog/TitleDialog';
import HeaderDialog from 'commons/dialog/HeaderDialog';
import Dataset from './Dataset';
import registry from 'commons/registry';
import declare from 'dojo/_base/declare';

export default declare([TitleDialog], {
  includeFooter: false,
  postCreate() {
    this.dialog = new HeaderDialog({maxWidth: 800}, this.dialog);
    this.dataset = new Dataset({inDialog: true}, this.dataset);
    this.inherited(arguments);
  },
  open(params) {
    this.dataset.showDataset(params.row.entry);

    const title = registry.get('rdfutils').getLabel(params.row.entry);
    this.updateLocaleStringsExplicit(title);
    this.show();
  },
});
