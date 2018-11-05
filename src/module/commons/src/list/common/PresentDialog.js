import ListDialogMixin from './ListDialogMixin';
import ContentViewSideDialog from '../../contentview/ContentViewSideDialog';

import declare from 'dojo/_base/declare';
import _WidgetBase from 'dijit/_WidgetBase';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import _WidgetsInTemplateMixin from 'dijit/_WidgetsInTemplateMixin';

export default declare([ContentViewSideDialog, ListDialogMixin], {
  open(params) {
    this.inherited(arguments);
    const entry = params.row.entry;
    this.show(entry, this.list.getTemplate(entry), this.list.getEntityConfig(entry));
  },
});
