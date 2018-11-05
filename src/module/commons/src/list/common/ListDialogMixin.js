import declare from 'dojo/_base/declare';
import aspect from 'dojo/aspect';

export default declare([], {
  row: null,
  _firstOpenDialog: true,
  constructor(params) {
    this.list = params.list;
  },

  connectIfFirstDialogOpen() {
    if (this._firstOpenDialog) {
      this._firstOpenDialog = false;
      const obj = this.dialog || this;
      if (typeof obj.hide === 'function') {
        // TODO: @scazan replace aspect
        aspect.after(this.dialog || this, 'hide', this.onDialogHide.bind(this));
      }
    }
  },

  onDialogHide() {
    if (this.row && this.list) {
      this.list.getView().clearSelection();
    }
  },

  open(params) {
    this.connectIfFirstDialogOpen();
    if (typeof params === 'object' && params.row && this.list) {
      this.row = params.row;
      this.list.getView().selectRow(this.row);
    }
  },
});
