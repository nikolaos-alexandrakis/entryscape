import ListDialogMixin from './ListDialogMixin';
import registry from '../../registry';

import declare from 'dojo/_base/declare';

export default declare([ListDialogMixin], {
  constructor(params) {
    this.list = params.list;
  },
  open(params) {
    this.currentParams = params;
    this.inherited(arguments);
    const list = this.list;
    const gb = list.nlsGenericBundle;
    const sb = list.nlsSpecificBundle;
    const removeConfirmMessage = sb[list.nlsRemoveEntryConfirm] ?
      sb[list.nlsRemoveEntryConfirm] : gb[list.nlsRemoveEntryConfirm];
    const removeFailedMessage = sb[list.nlsRemoveFailedKey] ?
      sb[list.nlsRemoveFailedKey] : gb[list.nlsRemoveFailedKey];
    const dialogs = registry.get('dialogs');
    dialogs.confirm(removeConfirmMessage, null, null,
      function (confirm) {
        if (confirm) {
          this.remove().then(() => {
            list.removeRow(params.row);
            params.row.destroy();
          }, () => {
            dialogs.acknowledge(removeFailedMessage);
          }).then(() => {
            list.getView().clearSelection();
          });
        } else {
          list.getView().clearSelection();
        }
      }.bind(this));
  },
  remove() {
    return this.currentParams.row.entry.del();
  },
});
