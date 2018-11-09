import declare from 'dojo/_base/declare';
import ListDialogMixin from './ListDialogMixin';
import ContentViewSideDialog from '../../contentview/ContentViewSideDialog';

export default declare([ContentViewSideDialog, ListDialogMixin], {
  open(params) {
    this.inherited(arguments);
    const entry = params.row.entry;
    this.show(entry, this.list.getTemplate(entry), this.list.getEntityConfig(entry));
  },
});
