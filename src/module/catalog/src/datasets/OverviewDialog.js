import declare from 'dojo/_base/declare';
import { i18n } from 'esi18n';
import m from 'mithril';
import TitleDialog from 'commons/dialog/TitleDialog';
import registry from 'commons/registry';
import ListDialogMixin from 'commons/list/common/ListDialogMixin';
import Overview from './components/Overview';

/**
 * Dialog for showing an overview of Dataset entries.
 * Uses the list specific bundle to get a title and button label via the keys "editHeader" and
 * "saveEditedEntry" respectively.
 */

// header NLS
// Title of bottom button
// label of bottom button
export default declare([TitleDialog, ListDialogMixin], {
  open(params) {
    this.inherited(arguments);
    // // this.updateGenericEditNLS();
    // this.refreshEntry(params.row.entry);
    m.render(this.containerNode, m(Overview));

    this.updateLocaleStringsExplicit('titleheader hello', 'DONE', 'done');
    this.show();
    // registry.set('context', params.row.entry.getContext());
  },
  show(uri, graph, template, level) {
    // // this.updateEditor(uri, graph, template, level);
    this.inherited(arguments);
  },
  refreshEntry(entry) {
    entry.setRefreshNeeded();
    entry.refresh().then(() => {
      if (this.isHidden()) {
        // this.showEntry(entry, this.list.getTemplate(entry), this.list.getTemplateLevel(entry));
        this.show(entry, this.list.getTemplate(entry), this.list.getTemplateLevel(entry));
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
    // this.updateTitleAndButton();
  },
  doneAction(graph) {
    this.row.entry.setMetadata(graph);
    const self = this;
    const async = registry.get('asynchandler');
    const b = this.NLSBundles.rdforms;
    async.addIgnore('commitMetadata', async.codes.GENERIC_PROBLEM, true);
    return this.row.entry.commitMetadata()
      .then(
        () => this.list.rowMetadataUpdated(this.row),
        (err) => {
          if (err.response.status === 412) {
            return registry.get('dialogs')
              .confirm(b.metadataConflictMessage, b.metadataConflictLoadChanges, b.metadataConflictCancel).then(() => {
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
