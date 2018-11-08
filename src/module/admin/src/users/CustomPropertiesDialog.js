import TitleDialog from 'commons/dialog/TitleDialog';
import ListDialogMixin from 'commons/list/common/ListDialogMixin';
import htmlUtil from 'commons/util/htmlUtil';
import { NLSMixin } from 'esi18n';
import esadUser from 'admin/nls/esadUser.nls';
import declare from 'dojo/_base/declare';
import _WidgetsInTemplateMixin from 'dijit/_WidgetsInTemplateMixin';
import template from './CustomPropertiesDialogTemplate.html';

export default declare([TitleDialog.ContentNLS, _WidgetsInTemplateMixin, ListDialogMixin, NLSMixin.Dijit], {
  templateString: template,
  maxWidth: 800,
  nlsBundles: [{ esadUser }],
  nlsHeaderTitle: 'customPropHeader',
  includeFooter: false,

  postCreate() {
    this.inherited(arguments);
  },
  open(params) {
    this.inherited(arguments);
    this.userEntry = params.row.entry;
    this._clearRows();
    this._renderRows();
  },
  _clearRows() {
    this.customPropTableBody.innerHTML = '';
  },
  _renderRows() {
    const self = this;
    this.userEntry.getResource().then((resourceEntry) => {
      const customProperties = resourceEntry.getCustomProperties();
      Object.keys(customProperties).forEach((property) => {
        const value = customProperties[property];
        const tr = htmlUtil.create('tr', null, self.customPropTableBody);
        htmlUtil.create('td', { innerHTML: property }, tr);
        htmlUtil.create('td', { innerHTML: value }, tr);
      });
      self.dialog.show();
    });
  },
});
