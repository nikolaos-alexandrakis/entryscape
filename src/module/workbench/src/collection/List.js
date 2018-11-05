import registry from 'commons/registry';
import EntryRow from 'commons/list/EntryRow';
import BaseList from 'commons/list/common/BaseList';
import RemoveMemberDialog from './dialogs/RemoveMemberDialog';
import typeIndex from 'commons/create/typeIndex';
import ManageMembersDialog from './dialogs/ManageMembersDialog';
import EditListDialog from './dialogs/EditListDialog';
import RemoveListDialog from './dialogs/RemoveListDialog';
import buttons from './utils/buttons';
import escoList from 'commons/nls/escoList.nls';
import eswoCollection from 'workbench/nls/eswoCollection.nls';
import declare from 'dojo/_base/declare';

const queryString = require('query-string');

const SingleButtonEntryRow = declare([EntryRow], {
  showCol1: false,
  showCol3: false,
  rowButtonMenu: false,
});

export default declare([BaseList], {
  includeCreateButton: false,
  includeEditButton: false,
  includeRemoveButton: false,
  includeRefreshButton: true,
  includeResultSize: false,
  nlsBundles: [{escoList}, {eswoCollection}],
  nlsRemoveEntryConfirm: 'removeEntryFromCollection',
  nlsRemoveCollectionConfirm: 'removeCollectionConfirm',
  nlsDownloadCollection: 'downloadCollection',
  nlsDownloadCollectionTitle: 'downloadCollectionHeaderTitle',
  searchVisibleFromStart: false,
  rowClickDialog: 'edit',
  listActionNames: ['refresh', 'manageMembers', 'editList', 'removeList'],
  listButtonMenu: true,
  rowClass: SingleButtonEntryRow,

  postCreate() {
    // List Actions
    this.registerListAction({
      name: 'manageMembers',
      button: 'success',
      icon: 'plus',
      noMenu: true,
      iconType: 'fa',
      max: this.createLimit,
      disableOnSearch: false,
    });

    this.registerListAction({
      name: 'editList',
      button: 'default',
      icon: 'pencil',
      iconType: 'fa',
      nlsKey: this.nlsEditEntryLabel,
    });

    this.registerListAction({
      name: 'removeList',
      button: 'warning',
      icon: 'remove',
      iconType: 'fa',
      nlsKey: this.nlsRemoveEntryLabel,
    });

    // Register Dialogs
    this.registerDialog('manageMembers', ManageMembersDialog); // add members to collection
    this.registerDialog('delete', RemoveMemberDialog); // remove members from collection
    this.registerDialog('editList', EditListDialog); // edit collection
    this.registerDialog('removeList', RemoveListDialog); // edit collection

    this.inherited(arguments);

    // Row Actions
    this.rowActions = [buttons.delete];
    this.listView.includeResultSize = !!this.includeResultSize; // make this boolean
  },
  show() {
    this.render();
  },
  getSearchObject() {
    const context = registry.get('context');
    /** @type {store/EntryStore} */
    const es = registry.get('entrystore');
    return es.newSolrQuery().context(context).lists(this.selectedCollection.getResourceURI());
  },

  getTemplate(entry) {
    const conf = typeIndex.getConf(entry);
    if (conf) {
      return registry.get('itemstore').getItem(conf.template);
    }

    return registry.get('itemstore').createTemplateFromChildren([
      'dcterms:title',
      'dcterms:description',
    ]);
  },
});
