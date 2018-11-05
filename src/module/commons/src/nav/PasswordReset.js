import {isFunction} from 'lodash-es';
import escoSignin from 'commons/nls/escoSignin.nls';
import config from 'config';
import TitleDialog from 'commons/dialog/TitleDialog';
import Password from 'commons/auth/Password';
import PasswordForm from 'commons/auth/components/PasswordForm';
import configUtil from 'commons/util/configUtil';
import template from './PasswordResetTemplate.html';
import registry from 'commons/registry';

import declare from 'dojo/_base/declare';
import _WidgetsInTemplateMixin from 'dijit/_WidgetsInTemplateMixin';

export default declare([TitleDialog.ContentNLS, _WidgetsInTemplateMixin], {
  templateString: template,
  nlsBundles: [{escoSignin}],
  nlsHeaderTitle: 'resetPasswordHeader',
  nlsFooterButtonLabel: 'resetPassword',
  maxWidth: 800,

  footerButtonAction() {
    const es = registry.get('entrystore');
    const sm = registry.getSiteManager();
    const successUrl = configUtil.getBaseUrl() + sm.getViewPath(registry.getSiteConfig().signinView);
    const pwResetInfo = {
      email: this.pwrUsername.value,
      password: Password.password,
      urlsuccess: successUrl,
      grecaptcharesponse: this.recaptchaResponse,
    };
    return es.getREST().post(`${es.getBaseURI()}auth/pwreset`, JSON.stringify(pwResetInfo))
      .then(() => {
        return registry.get('dialogs')
          .acknowledge(this.NLSBundle0.passwordResetConfirmationMessage);
      }, () => {
        throw this.NLSBundle0.passwordResetErrorMessage;
      });
  },
  show() {
    Password.clear();
    m.mount(this.passwordFormNode, PasswordForm('reset', this.check.bind(this)));
    this.check();
    registry.get('addRecaptcha')(this.recaptcha, function (val) {
      this.recaptchaResponse = val;
      this.check();
    }.bind(this), function () {
      this.recaptchaResponse = null;
      this.check();
    }.bind(this));
    this.dialog.show();
  },
  postCreate() {
    this.inherited(arguments);
    this.domNode.onkeyup = this.check.bind(this);
  },

  check() {
    if (this.checkTimer) {
      clearTimeout(this.checkTimer);
      delete this.checkTimer;
    }

    this.checkTimer = setTimeout(function () {
      delete this.checkTimer;
      let valid = true;
      if (isFunction(this.domNode.checkValidity)) {
        valid = this.domNode.checkValidity();
      }
      if (this.recaptchaResponse == null) {
        valid = false;
      }

      this.validateEmail();
      if (!Password.canSubmit()) {
        valid = false;
      }

      if (valid) {
        this.dialog.unlockFooterButton();
      } else {
        this.dialog.lockFooterButton();
      }
    }.bind(this), 400);
  },
  validateEmail() {
    if (this.pwrUsername.value.length > 0 &&
      isFunction(this.pwrUsername.checkValidity) && !this.pwrUsername.checkValidity()) {
      this.setStatus(this.emailStatus, this.NLSBundle0.signupInvalidEmail);
    } else {
      this.setStatus(this.emailStatus);
    }
  },
  setStatus(node, message) {
    if (message) {
      node.style.display = '';
      node.innerHTML = message;
    } else {
      node.style.display = 'none';
    }
  },
});
