import ListDialogMixin from 'commons/list/common/ListDialogMixin';

export default class RemoveListDialog extends ListDialogMixin {
  open(params) {
    this.inherited(arguments);
    const list = params.list;
    this.selectedCollection = list.selectedCollection;
    const gb = list.nlsGenericBundle;
    const sb = list.nlsSpecificBundle;
    const removeConfirmMessage = sb[list.nlsRemoveCollectionConfirm] ?
      sb[list.nlsRemoveCollectionConfirm] : gb[list.nlsRemoveCollectionConfirm];
    const removeFailedMessage = sb[list.nlsRemoveFailedKey] ?
      sb[list.nlsRemoveFailedKey] : gb[list.nlsRemoveFailedKey];
    const dialogs = registry.get('dialogs');
    dialogs.confirm(removeConfirmMessage, null, null, (confirm) => {
      if (confirm) {
        this.remove().then(null, () => {
          dialogs.acknowledge(removeFailedMessage);
        }).then(() => {
          list.getView().clearSelection();
        });
      } else {
        list.getView().clearSelection();
      }
    });
  }
  remove() {
    return this.selectedCollection.del();
  }
}
