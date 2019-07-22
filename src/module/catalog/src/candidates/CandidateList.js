import registry from 'commons/registry';
import ETBaseList from 'commons/list/common/ETBaseList';
import ProgressDialog from 'commons/progress/ProgressDialog';
import CommentDialog from 'commons/comments/CommentDialog';
import RDFormsEditDialog from 'commons/rdforms/RDFormsEditDialog';
import escoList from 'commons/nls/escoList.nls';
import escaCandidates from 'catalog/nls/escaCandidates.nls';
import config from 'config';
import declare from 'dojo/_base/declare';
import ListView from '../utils/ListView';
import CandidateRow from './CandidateRow';
import UpgradeDialog from './UpgradeDialog';
import PreparationsOverview from './views/Overview';
import MithrilView from 'commons/view/MithrilView';

const ns = registry.get('namespaces');

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

let viewExport;
const preparationsView = declare(MithrilView, {
  mainComponent: () => ({
    view() {
      return <PreparationsOverview />;
    },
  }),
});

const candidatesView = declare([ETBaseList], {
  includeCreateButton: true,
  includeInfoButton: false,
  includeEditButton: true,
  includeRemoveButton: true,
  nlsBundles: [{ escoList }, { escaCandidates }],
  entitytype: 'candidate',
  entryType: ns.expand('esterms:CandidateDataset'),
  nlsCreateEntryLabel: 'createCandidate',
  nlsCreateEntryTitle: 'createCandidatePopoverTitle',
  nlsCreateEntryMessage: 'createCandidatePopoverMessage',
  class: 'candidatedataset',
  listViewClass: ListView,
  rowClass: CandidateRow,
  searchVisibleFromStart: false,
  // Versions explicitly excluded since the support for checklist is not in metadata
  rowActionNames: ['edit', 'upgrade', 'progress', 'comment', 'remove'],
  rowClickDialog: 'progress',

  postCreate() {
    this.registerDialog('progress', ProgressDialog);
    this.registerDialog('upgrade', UpgradeDialog);
    this.registerDialog('comment', CommentDialog2);
    this.registerRowAction({
      name: 'progress',
      button: 'default',
      icon: 'check-square',
      iconType: 'fa',
      nlsKey: 'progressMenu',
      nlsKeyTitle: 'progressTitle',
    });
    this.registerRowAction({
      name: 'upgrade',
      button: 'default',
      icon: 'level-up-alt',
      iconType: 'fa',
      nlsKey: 'upgrade',
      nlsKeyTitle: 'upgradeTitle',
    });
    this.registerRowAction({
      name: 'comment',
      button: 'default',
      icon: 'comment',
      iconType: 'fa',
      nlsKey: 'commentMenu',
      nlsKeyTitle: 'commentMenuTitle',
    });
    this.inherited('postCreate', arguments);
    this.registerDialog('create', CreateDialog);
    this.dialogs.create.levels.setIncludeLevel('optional');
  },

  show() {
    const self = this;
    const esu = registry.get('entrystoreutil');
    esu.preloadEntries(ns.expand('esterms:CandidateDataset'), null).then(self.render());
  },
  getSearchObject() {
    /** @type {store/EntryStore} */
    const es = registry.get('entrystore');
    return es.newSolrQuery().rdfType(ns.expand('esterms:CandidateDataset'))
      .context(registry.get('context'));
  },
  getTemplate() {
    if (!this.template) {
      this.template = registry.get('itemstore').getItem(config.catalog.datasetCandidateTemplateId);
    }
    return this.template;
  },
  getTemplateLevel() {
    return 'recommended';
  },
});

// const configured = 'candidates';
const configured = 'preparations';
if (configured === 'preparations') {
  viewExport = preparationsView;
} else {
  viewExport = candidatesView;
}

export default viewExport;
