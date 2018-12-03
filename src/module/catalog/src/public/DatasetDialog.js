import TitleDialog from 'commons/dialog/TitleDialog';
import registry from 'commons/registry';
import declare from 'dojo/_base/declare';
import Dataset from './Dataset';
import templateString from './DatasetDialogTemplate.html';

export default declare([TitleDialog.Content], {
  templateString,
  includeFooter: false,
  postCreate() {
    this.dataset = new Dataset({ inDialog: true }, this.dataset);
    this.inherited(arguments);
  },
  open(params) {
    this.dataset.showDataset(params.row.entry);
    const title = registry.get('rdfutils').getLabel(params.row.entry);
    this.dialog.updateLocaleStringsExplicit(title);
    this.dialog.show();
  },
});
