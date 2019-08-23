import declare from 'dojo/_base/declare';
import RDFormsEditDialog from 'commons/rdforms/RDFormsEditDialog';
import registry from 'commons/registry';
import config from 'config';

export default declare([RDFormsEditDialog], {
  nlsHeaderTitle: 'metadataEditDialogHeader', // should be editDatasetHeader
  nlsFooterButtonLabel: 'saveChanges',

  showEntry(entry, updateDataset) {
    this.entry = entry;
    this.updateDataset = updateDataset;
    this.inherited('showEntry', arguments, [entry]);
  },
  doneAction(graph) {
    this.entry.setMetadata(graph);
    const self = this;
    const async = registry.get('asynchandler');
    const b = this.NLSLocalized.rdforms;
    async.addIgnore('commitMetadata', async.codes.GENERIC_PROBLEM, true);
    return this.entry.commitMetadata()
      .then(
        () => this.updateDataset(),
        (err) => {
          if (err.response.status === 412) {
            return registry.get('dialogs')
              .confirm(b.metadataConflictMessage, b.metadataConflictLoadChanges, b.metadataConflictCancel).then(() => {
                self.refreshEntry(self.entry);
                throw b.metadataConflictRefreshMessage;
              }, () => {
                throw b.metadataConflictRemainMessage;
              });
          }
          throw err;
        },
      );
  },
});
