import htmlUtil from 'commons/util/htmlUtil';
import ListDialogMixin from 'commons/list/common/ListDialogMixin';
import eswoCollection from 'workbench/nls/eswoCollection.nls';
import { NLSMixin } from 'esi18n';
import declare from 'dojo/_base/declare';

export default declare([ListDialogMixin, NLSMixin.Dijit], {
  nlsBundles: [{ eswoCollection }],
  /**
   * This "dialog" does three things:
   * 1. Add a member to a collection
   * 2. refresh the collection list
   * 3. remove button on just added entry row
   *
   * @param params
   */
  open(params) {
    this.inherited(arguments);
    this.selectedCollection = params.list.collectionList;
    this.selectedEntry = params.row.entry;

    // 1. add member to collection
    this.addMember().then(() => {
      // 2. refresh the parent list
      // this.selectedCollectionView refers to the parent collection that initiated the dialog
      // TODO ideally this shouldn't happen here, but the list should be rerendered with the
      // up to date items. However, that is problematic due to Solr indexing taking some time
      // (in the order of sec) to update.
      this.list.selectedCollectionView.addRowForEntry(params.row.entry);

      // 3. change the button to a label
      params.row.buttonsNode.childNodes[0].style.setProperty('visibility', 'hidden'); // hack to keep fixed height
      htmlUtil.create('span', {
        type: 'button',
        class: 'label label-primary',
        style: 'font-size: 12px',
        innerHTML: registry.get('localize')(params.list.NLSLocalized1.addedMembersLabel), // use
        // nls from parent list
      }, params.row.buttonsNode);
    });
  },
  addMember() {
    return this.selectedCollection.getResource(true).addEntry(this.selectedEntry).then(() => {
      this.selectedCollection.setRefreshNeeded();
      this.selectedCollection.refresh();
    });
  },
});
