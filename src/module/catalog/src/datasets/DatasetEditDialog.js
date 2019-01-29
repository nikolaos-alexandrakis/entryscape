import declare from 'dojo/_base/declare';
import RDFormsEditDialog from 'commons/rdforms/RDFormsEditDialog';
import registry from 'commons/registry';
import config from 'config';

export default declare([RDFormsEditDialog], {
  title: 'Edit Dataset',
  nlsHeaderTitle: 'metadataEditDialogHeader',
  nlsFooterButtonLabel: 'metadataEditDialogDoneLabel',

  showEntry(entry) {
    this.entry = entry;
    this.inherited('showEntry', arguments, [entry, this.getTemplate()]);
  },
  getTemplate() {
    return registry.get('itemstore').getItem(
      config.catalog.datasetTemplateId);
  },

  doneAction(graph) {
    this.entry.setMetadata(graph);
    const self = this;
    const async = registry.get('asynchandler');
    const b = this.NLSBundles.rdforms;
    async.addIgnore('commitMetadata', async.codes.GENERIC_PROBLEM, true);
    return this.entry.commitMetadata()
      .then(
        // () => this.list.rowMetadataUpdated(this.row),
        () => console.log('saved'),
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
