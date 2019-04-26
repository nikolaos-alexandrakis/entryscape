import registry from 'commons/registry';
import ListDialogMixin from 'commons/list/common/ListDialogMixin';
import TitleDialog from 'commons/dialog/TitleDialog';
import { renderingContext } from 'rdforms';
import { NLSMixin } from 'esi18n';
import eswoSpaces from 'workbench/nls/eswoSpaces.nls';
import declare from 'dojo/_base/declare';
import _WidgetsInTemplateMixin from 'dijit/_WidgetsInTemplateMixin';
import template from './CreateDialogTemplate.html';

export default declare([TitleDialog.ContentNLS, _WidgetsInTemplateMixin, ListDialogMixin, NLSMixin.Dijit], {
  templateString: template,
  maxWidth: 800,
  nlsBundles: [{ eswoSpaces }],
  nlsHeaderTitle: 'createWorkspaceHeader',
  nlsFooterButtonLabel: 'createWorkspaceButton',

  postCreate() {
    this.inherited(arguments);
  },

  /**
   * Clears and resets the form
   *
   * @returns {undefined}
   */
  clearFields() {
    this.workspaceName.value = '';
    this.workspaceDesc.value = '';
  },

  open() {
    this.list.getView().clearSearch();
    this.clearFields();
    this.dialog.show();
  },
  footerButtonAction() {
    let group;
    let hc;
    const name = this.workspaceName.value;
    const desc = this.workspaceDesc.value;
    const store = registry.get('entrystore');
    if (name === '' || desc === '') {
      return this.NLSLocalized.eswoSpaces.insufficientInfoToCreateWorkspace;
    }
    let context;
    let centry;
    return store.createGroupAndContext()
      .then((entry) => {
        group = entry;
        hc = entry.getResource(true).getHomeContext();
        context = store.getContextById(hc);
        if (!registry.get('hasAdminRights')) {
          this.list.entryList.setGroupIdForContext(context.getId(), group.getId());
        }
        return context.getEntry();
      })
      .then((contextEntry) => {
        centry = contextEntry;
        const l = renderingContext.getDefaultLanguage();
        const md = contextEntry.getMetadata();
        md.addL(contextEntry.getResourceURI(), 'dcterms:title', name, l);
        md.addL(contextEntry.getResourceURI(), 'dcterms:description', desc, l);
        return contextEntry.commitMetadata();
      })
      .then((ctxEntry) => {
        const hcEntryInfo = ctxEntry.getEntryInfo();
        hcEntryInfo.getGraph().add(ctxEntry.getResourceURI(), 'rdf:type', 'esterms:WorkbenchContext');
        // TODO remove when entrystore is changed so groups have read access to
        // homecontext metadata by default.
        // Start fix with missing metadata rights on context for group
        const acl = hcEntryInfo.getACL(true);
        acl.mread.push(group.getId());
        hcEntryInfo.setACL(acl);
        // End fix
        return hcEntryInfo.commit().then(() => {
          const row = this.list.getView().addRowForEntry(centry);
          this.list.rowMetadataUpdated(row);
          const userEntry = registry.get('userEntry');
          userEntry.setRefreshNeeded();
          userEntry.refresh();
          this.clearFields();
        });
      }, (err) => {
        // dialogs.acknowledge(err);
        throw err;
      });
  },
});
