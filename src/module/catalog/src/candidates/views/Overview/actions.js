import { createEntry } from 'commons/util/storeUtil';
import { i18n } from 'esi18n';
import registry from 'commons/registry';
import config from 'config';
import DOMUtil from 'commons/util/htmlUtil';
import declare from 'dojo/_base/declare';
import escaPreparationsNLS from 'catalog/nls/escaPreparations.nls';
import RDFormsEditDialog from 'commons/rdforms/RDFormsEditDialog';
import CommentDialog from 'commons/comments/CommentDialog';

const getTemplate = () => registry.get('itemstore')
  // .getItem('esterms:Suggestion');
  .getItem(config.catalog.datasetCandidateTemplateId);

const CreateDialog = declare(RDFormsEditDialog, {
  maxWidth: 800,
  explicitNLS: true,
  constructor(params) {
    this.list = params.list;
  },
  open() {
    const escaPreparation = i18n.getLocalization(escaPreparationsNLS);
    // this.list.getView().clearSearch();
    this.title = escaPreparation.createSuggestionHeader;
    this.doneLabel = escaPreparation.createSuggestionButton;
    this.updateTitleAndButton();

    this.newSuggestion = createEntry(null, 'esterms:Suggestion');
    const newSuggestion = this.newSuggestion;

    registry.get('getGroupWithHomeContext')(newSuggestion.getContext())
      .then((groupEntry) => {
        const entryInfo = newSuggestion.getEntryInfo();
        const acl = entryInfo.getACL(true);
        acl.admin.push(groupEntry.getId());
        entryInfo.setACL(acl);
      });

    newSuggestion.getMetadata()
      .add(newSuggestion.getResourceURI(), 'rdf:type', 'esterms:Suggestion');

    this.show(newSuggestion.getResourceURI(), newSuggestion.getMetadata(),
      getTemplate(), 'mandatory');
  },
  doneAction(graph) {
    return this.newSuggestion.setMetadata(graph)
      .commit()
      .then((newEntry) => {
        // this.list.getView().addRowForEntry(newEntry);
        return newEntry.refresh();
      });
  },
});

const CommentDialog2 = declare([CommentDialog], {
  maxWidth: 800,
  title: 'temporary', // to avoid exception
  open(params) {
    this.inherited(arguments);
    const name = registry.get('rdfutils').getLabel(params.row.entry);
    this.title = i18n.renderNLSTemplate(this.list.nlsSpecificBundle.commentHeader, { name });
    this.footerButtonLabel = this.list.nlsSpecificBundle.commentFooterButton;
    this.localeChange();
  },
});

export default (nothing, wrapperFunction) => {
  const createSuggestion = (onDone) => {
    const createDialog = new CreateDialog({
      destroyOnHide: true,
      row: {
        // entry: suggestion,
      },
    }, DOMUtil.create('div'));
    // @scazan Some glue here to communicate with RDForms without a "row"
    createDialog.open({ onDone });
  };

  const actions = {
    createSuggestion,
  };

  // Sometimes we may need to compose a wrapper function.
  // For instance, when we use e.preventDefault or e.stopPropagation
  if (wrapperFunction) {
    Object.entries(actions)
      .forEach((nameAction) => {
        actions[nameAction[0]] = wrapperFunction(nameAction[1]);
      });
  }

  return actions;
};
