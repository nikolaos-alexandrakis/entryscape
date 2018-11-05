import defaults from '../../defaults';
import ListDialogMixin from 'commons/list/common/ListDialogMixin';

export default class RemoveMemberDialog extends ListDialogMixin {
  open(params) {
    this.inherited(arguments);
    this.selectedCollection = params.list.selectedCollection;
    this.selectedEntry = params.row.entry;

    // prepare nls and dialog message
    const gb = params.list.nlsGenericBundle;
    const sb = params.list.nlsSpecificBundle;
    const removeConfirmMessage = sb[params.list.nlsRemoveEntryConfirm] ?
      sb[params.list.nlsRemoveEntryConfirm] : gb[params.list.nlsRemoveEntryConfirm];
    const removeFailedMessage = sb[params.list.nlsRemoveFailedKey] ?
      sb[params.list.nlsRemoveFailedKey] : gb[params.list.nlsRemoveFailedKey];
    const dialogs = registry.get('dialogs');

    // show dialog and act
    dialogs.confirm(removeConfirmMessage, null, null, (confirm) => {
      if (confirm) {
        this.removeMember().then(() => {
          params.list.getView().removeRow(params.row);
          params.row.destroy();
        }, () => {
          dialogs.acknowledge(removeFailedMessage);
        });
      } else {
        params.list.listView.clearSelection();
      }
    });
  }

  /**
   *
   * @return {Promise|*}
   */
  removeMember() {
    return this.selectedCollection.getResource(true).removeEntry(this.selectedEntry).then(() => {
      this.selectedCollection.setRefreshNeeded();
      this.selectedCollection.refresh();
    });
  }
};
