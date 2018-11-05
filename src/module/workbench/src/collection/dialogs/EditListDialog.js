import ListDialogMixin from 'commons/list/common/ListDialogMixin';
import RDFormsEditDialog from 'commons/rdforms/RDFormsEditDialog';
import {i18n} from 'esi18n';

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
    this.refreshEntry(params.list.selectedCollection);
  },
  refreshEntry(entry) {
    entry.setRefreshNeeded();
    entry.refresh().then(() => {
      if (this.isHidden()) {
        this.showEntry(entry, this.list.getTemplate(entry), this.list.getTemplateLevel(entry));
      } else {
        this.updateEntry(entry, this.list.getTemplate(entry), this.list.getTemplateLevel(entry));
      }
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
    this.list.selectedCollection.setMetadata(graph);
    const async = registry.get('asynchandler');
    const b = this.NLSBundles.rdforms;
    async.addIgnore('commitMetadata', async.codes.GENERIC_PROBLEM, true);
    return this.list.selectedCollection.commitMetadata().then(null,
      (err) => {
        if (err.response.status === 412) {
          return registry.get('dialogs').confirm(b.metadataConflictMessage, b.metadataConflictLoadChanges, b.metadataConflictCancel).then(() => {
            this.refreshEntry(this.list.selectedCollection);
            throw b.metadataConflictRefreshMessage;
          }, () => {
            throw b.metadataConflictRemainMessage;
          });
        }
        throw err;
      });
  },
});
