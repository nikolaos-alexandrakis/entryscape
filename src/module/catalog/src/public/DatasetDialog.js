import registry from 'commons/registry';
import TitleDialog from 'commons/dialog/TitleDialog';
import Dataset from './Dataset';
import declare from 'dojo/_base/declare';

export default declare([TitleDialog], {
  includeFooter: false,
  postCreate() {
    this.dataset = new Dataset({inDialog: true}, this.containerNode);
    this.inherited(arguments);
  },
  postCreate() {
    this.dialog = new HeaderDialog({maxWidth: 800}, this.dialog);
    this.dataset = new Dataset({inDialog: true}, this.dataset);
  },
  open(params) {
    this.dataset.showDataset(params.row.entry);

    const title = defaults.get('rdfutils').getLabel(params.row.entry);
    this.updateLocaleStringsExplicit(title);
    this.show();
  },
});
