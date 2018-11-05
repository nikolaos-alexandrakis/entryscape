import {i18n} from 'esi18n';
import ListDialogMixin from './ListDialogMixin';
import registry from '../../registry';
import RDFormsEditDialog from '../../rdforms/RDFormsEditDialog';
import declare from 'dojo/_base/declare';

/**
 * Dialog for editing existing entries.
 * Uses the list specific bundle to get a title and button label via the keys "editHeader" and
 * "saveEditedEntry" respectively.
 */

export default declare([RDFormsEditDialog, ListDialogMixin], {
  explicitNLS: true,
  open(params) {
    this.inherited(arguments);
    this.updateGenericEditNLS();
    this.refreshEntry(params.row.entry);
    registry.set('context', params.row.entry.getContext());
  },
  refreshEntry(entry) {
    entry.setRefreshNeeded();
    entry.refresh().then(() => {
      if (this.isHidden()) {
        this.showEntry(entry, this.list.getTemplate(entry), this.list.getTemplateLevel(entry));
      } else {
        this.updateEntry(entry, this.list.getTemplate(entry), this.list.getTemplateLevel(entry));
      }
      this.list.rowMetadataUpdated(this.row, true);
    });
  },
  updateGenericEditNLS() {
    const name = this.list.getName();
    const b = this.list.nlsSpecificBundle.editHeader ?
      this.list.nlsSpecificBundle : this.list.nlsGenericBundle;
    this.title = i18n.renderNLSTemplate(b.editHeader, name);
    this.doneLabel = b.saveEditedEntry; // Improve
    this.updateTitleAndButton();
  },
  doneAction(graph) {
    this.row.entry.setMetadata(graph);
    const self = this;
    const async = registry.get('asynchandler');
    const b = this.NLSBundles.rdforms;
    async.addIgnore('commitMetadata', async.codes.GENERIC_PROBLEM, true);
    return this.row.entry.commitMetadata()
      .then(() => {
          this.list.rowMetadataUpdated(this.row);
        }, (err) => {
          if (err.response.status === 412) {
            return registry.get('dialogs').confirm(b.metadataConflictMessage, b.metadataConflictLoadChanges, b.metadataConflictCancel).then(() => {
              self.refreshEntry(self.row.entry);
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
