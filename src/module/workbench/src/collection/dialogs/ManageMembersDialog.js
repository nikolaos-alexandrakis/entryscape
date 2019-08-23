import TitleDialog from 'commons/dialog/TitleDialog';
import ListDialogMixin from 'commons/list/common/ListDialogMixin';
import EntryRow from 'commons/list/EntryRow';
import BaseList from 'commons/list/common/BaseList';
import { types } from 'store';
import { i18n, NLSMixin } from 'esi18n';
import eswoCollection from 'workbench/nls/eswoCollection.nls';
import escoList from 'commons/nls/escoList.nls';
import declare from 'dojo/_base/declare';
import AddMemberDialog from './AddMemberDialog';
import Note from '../components/Note';
import buttons from '../utils/buttons';

const SingleButtonEntryRow = declare([EntryRow], {
  showCol1: false,
  showCol3: false,
  rowButtonMenu: false,
  postCreate() {
    this.inherited(arguments);
    this.buttonsNode.style.width = 'initial';
  },

  /**
   * Check if the button should be installed or not depending if the entry is in the
   * collection already
   *
   * @param params
   */
  installButtonOrNot(params) {
    const id = this.entry.getId();
    const ids = this.list.inListEntryIds;

    switch (params.name) {
      case 'add':
        return !ids.has(id);
      default:
        return true;
    }
  },
});

const EntryList = declare([BaseList], {
  nlsBundles: [{ escoList }, { eswoCollection }],
  includeCreateButton: false,
  rowClass: SingleButtonEntryRow,

  constructor(params) {
    this.collectionList = params.selectedCollection;
    this.collectionResource = this.collectionList.getResource(true);
    this.collectionResource.getAllEntryIds().then((ids) => {
      this.inListEntryIds = new Set(ids);
    });

    this.domNode = params.domNode;
  },

  postCreate() {
    this.inherited('postCreate', arguments);
    this.listView.includeResultSize = !!this.includeResultSize; // make this boolean
    this.listView.domNode = this.domNode;

    this.rowActions = [buttons.add];

    this.registerDialog('add', AddMemberDialog);
  },

  getSearchObject() {
    const context = registry.get('context');
    /** @type {store/EntryStore} */
    const es = registry.get('entrystore');

    return es.newSolrQuery().context(context)
      .lists(this.collectionResource.getResourceURI(), true)
      .graphType(types.GT_LIST, true);
  },
});

export default declare([TitleDialog, ListDialogMixin, NLSMixin.Dijit], {
  maxWidth: 800,
  nlsBundles: [{ eswoCollection }],
  nlsHeaderTitle: 'manageMembersHeader',
  nlsFooterButtonLabel: 'manageMembersButton',
  includeNote: true,

  postCreate() {
    this.inherited(arguments);
  },

  localeChange() {
    // this.updateLocaleStrings(this.NLSLocalized0);
    this.updateLocaleStrings(this.NLSLocalized.escoList);
  },
  open(params) {
    this.selectedCollection = params.list.selectedCollection;
    this.selectedCollectionView = params.list.listView;

    this.show();

    this.membersList = new EntryList({
      selectedCollection: this.selectedCollection,
      selectedCollectionView: this.selectedCollectionView,
      domNode: this.containerNode,
    }, htmlUtil.create('div', null, this.containerNode));
    this.membersList.render();

    this.inherited(arguments);
  },
  closeNote(e) {
    e.preventDefault();
    this.noteNode.style.display = 'none';
  },
  renderNote() {
    this.noteNode = htmlUtil.create('div', null, this.containerNode);

    const noteText = i18n.localize(escoList, 'manageMembersNoteText');
    const addLabelText = i18n.localize(escoList, 'addMemberLabel');
    const removeLabelText = i18n.localize(escoList, 'removeMemberLabel');

    m.render(this.noteNode, m(Note, {
      text: noteText,
      addLabel: addLabelText,
      removeLabel: removeLabelText,
      onClose: this.closeNote.bind(this),
    }));
  },
  hideComplete() {
    this.containerNode.innerHTML = '';
  },
});
