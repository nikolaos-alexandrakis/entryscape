import TitleDialog from 'commons/dialog/TitleDialog';
import ListDialogMixin from 'commons/list/common/ListDialogMixin';
import ACL from 'commons/acl/ACL';
import {NLSMixin} from 'esi18n';
import esadContext from 'admin/nls/esadContext.nls';

import declare from 'dojo/_base/declare';
import _WidgetsInTemplateMixin from 'dijit/_WidgetsInTemplateMixin';

export default declare([TitleDialog.Content, ListDialogMixin, _WidgetsInTemplateMixin, NLSMixin.Dijit], {
  templateString: '<div><div data-dojo-attach-point="acl"></div></div>',
  maxWidth: 800,
  nlsBundles: [{esadContext}],
  nlsHeaderTitle: 'contextACLHeader',
  nlsFooterButtonLabel: 'updateContextACLButton',

  postCreate() {
    this.inherited(arguments);
    this.acl = new ACL({}, this.acl);
    this.acl.onChange = () => this.dialog.unlockFooterButton();
  },

  open(params) {
    this.inherited(arguments);
    this.entry = params.row.entry;
    this.acl.showEntry(this.entry);
    this.localeChange();
    this.dialog.lockFooterButton();
    this.dialog.show();
  },

  localeChange() {
    if (this.NLSBundle0 && this.row != null) {
      const res = this.row.getRenderName();// fix for [object Promise]
      if (typeof res === 'string') {
        this.dialog.updateLocaleStrings(this.NLSBundle0,
          {name: res});
      } else if (typeof res === 'object' && typeof res.then === 'function') {
        res.then(name => this.dialog.updateLocaleStrings(this.NLSBundle0, {name}));
      }
    }
  },

  footerButtonAction() {
    return this.acl.saveACL();
  },
});
