import { createEntry } from 'commons/util/storeUtil';
import { i18n } from 'esi18n';
import RDFormsEditDialog from 'commons/rdforms/RDFormsEditDialog';
import CommentDialog from 'commons/comments/CommentDialog';

const CreateDialog = declare(RDFormsEditDialog, {
  maxWidth: 800,
  explicitNLS: true,
  constructor(params) {
    this.list = params.list;
  },
  open() {
    this.list.getView().clearSearch();
    this.title = this.list.nlsSpecificBundle.createCandidateDatasetHeader;
    this.doneLabel = this.list.nlsSpecificBundle.createCandidateDatasetButton;
    this.updateTitleAndButton();
    const nds = createEntry(null, 'dcat:Dataset');
    this._newCandidate = nds;
    registry.get('getGroupWithHomeContext')(nds.getContext())
      .then((groupEntry) => {
        const ei = nds.getEntryInfo();
        const acl = ei.getACL(true);
        acl.admin.push(groupEntry.getId());
        ei.setACL(acl);
      });

    nds.getMetadata().add(nds.getResourceURI(), 'rdf:type', 'esterms:CandidateDataset');
    this.show(nds.getResourceURI(), nds.getMetadata(),
      this.list.getTemplate(), this.list.getTemplateLevel(nds));
  },
  doneAction(graph) {
    return this._newCandidate.setMetadata(graph).commit()
      .then((newEntry) => {
        this.list.getView().addRowForEntry(newEntry);
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
