import ListDialogMixin from 'commons/list/common/ListDialogMixin';
import m from 'mithril';
import TitleDialog from 'commons/dialog/TitleDialog';
import Password from 'commons/auth/Password';
import PasswordForm from 'commons/auth/components/PasswordForm';
import { NLSMixin } from 'esi18n';
import esadUser from 'admin/nls/esadUser.nls';
import declare from 'dojo/_base/declare';
import _WidgetsInTemplateMixin from 'dijit/_WidgetsInTemplateMixin';
import template from './PasswordDialogTemplate.html';

export default declare([TitleDialog.ContentNLS, _WidgetsInTemplateMixin, ListDialogMixin, NLSMixin.Dijit], {
  templateString: template,
  maxWidth: 800,
  nlsBundles: [{ esadUser }],
  nlsHeaderTitle: 'setPasswordHeader',
  nlsFooterButtonLabel: 'setPasswordButton',

  open(params) {
    this.inherited(arguments);
    Password.clear();
    m.mount(this.passwordFormNode, PasswordForm('admin', this.check.bind(this)));

    this.userEntry = params.row.entry;
    this.dialog.lockFooterButton();
    this.dialog.show();
  },
  check() {
    if (Password.canSubmit() && Password.provided()) {
      this.dialog.unlockFooterButton();
    } else {
      this.dialog.lockFooterButton();
    }
  },
  footerButtonAction() {
    this.userEntry.getResource().then(resourceEntry =>
      resourceEntry.setPassword(Password.password)
        .then(null, () => {
          throw this.NLSBundles.esadUser.setPasswordError;
        }));
  },
});
