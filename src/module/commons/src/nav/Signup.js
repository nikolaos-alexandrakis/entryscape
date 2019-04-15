import config from 'config';
import { clone, template } from 'lodash-es';
import registry from 'commons/registry';
import escoSignin from 'commons/nls/escoSignin.nls';
import declare from 'dojo/_base/declare';
import _WidgetsInTemplateMixin from 'dijit/_WidgetsInTemplateMixin';
import m from 'mithril';
import templateString from './SignupTemplate.html';
import TitleDialog from '../dialog/TitleDialog';
import signinUtils from './signinUtils';
import Password from '../auth/Password';
import PasswordForm from '../auth/components/PasswordForm';
import configUtil from '../util/configUtil';

export default declare([TitleDialog.ContentNLS, _WidgetsInTemplateMixin], {
  templateString,
  nlsBundles: [{ escoSignin }],
  nlsHeaderTitle: 'createAccountHeader',
  nlsFooterButtonLabel: 'createAccount',
  maxWidth: 800,

  footerButtonAction() {
    this.setStatus(this.signupStatus);
    const nationalNumber = this.nationalNumber.value;
    if (!this.validateNationalId()) {
      return undefined;
    }
    if (!Password.canSubmit()) {
      return undefined;
    }
    const es = registry.get('entrystore');
    const sm = registry.getSiteManager();
    const params = clone(sm.getUpcomingOrCurrentParams());
    params.view = 'signin'; // TODO define in site config and use from there instead
    params.nextView = 'start'; // TODO define in site config and use from there instead
    let urlsuccess = window.location.href;
    const fragment = urlsuccess.indexOf('#');
    urlsuccess = (fragment >= 0 ? urlsuccess.substr(0, fragment) : urlsuccess) + sm.getViewPath('signin', params);
    const signupInfo = {
      firstname: this.suFirstname.value,
      lastname: this.suLastname.value,
      email: this.suUsername.value,
      password: Password.password,
      urlsuccess,
      grecaptcharesponse: this.recaptchaResponse,
    };
    if (registry.getSiteConfig().nationalIdNumber) {
      signupInfo.custom_nationalid = nationalNumber;
    }
    const b = this.NLSLocalized0;
    return es.getREST()
      .post(`${es.getBaseURI()}auth/signup`, JSON.stringify(signupInfo)).then(() => registry.get('dialogs').acknowledge(b.signupConfirmationMessage), (err) => {
        if (err.response.status === 417) {
          throw template(b.signupWrongDomain)({
            domain: signupInfo.email.substr(signupInfo.email.indexOf('@') + 1),
          });
        } else {
          throw b.signupErrorMessage;
        }
      });
  },
  postCreate() {
    this.inherited('postCreate', arguments);
    if (registry.getSiteConfig().nationalIdNumber) {
      this.nationalNumberNode.style.display = '';
      this.nationalNumber.setAttribute('required', 'required');
    }
    this.dialog.lockFooterButton();
    const check = this.check.bind(this);
    this.domNode.onkeyup = check;
    this.checkboxPUL.onchange = check;
  },

  check() {
    if (this.checkTimer) {
      clearTimeout(this.checkTimer);
      delete this.checkTimer;
    }

    this.checkTimer = setTimeout(() => {
      delete this.checkTimer;
      let valid = true;
      if (typeof (this.domNode.checkValidity) === 'function') {
        valid = this.domNode.checkValidity();
      }
      if (this.recaptchaResponse == null) {
        valid = false;
      }
      if (!Password.canSubmit()) {
        valid = false;
      }
      this.validateNationalId();
      this.validateFirstName();
      this.validateEmail();

      if (valid) {
        this.dialog.unlockFooterButton();
      } else {
        this.dialog.lockFooterButton();
      }
    }, 400);
  },
  setStatus(node, message) {
    if (message) {
      node.style.display = '';
      node.innerHTML = message;
    } else {
      node.style.display = 'none';
    }
  },
  showPULInfoDialog() {
    let assetsPath = configUtil.getAssetsPath();
    if (config.theme && config.theme.privacyLink) {
      window.open(config.theme.privacyLink, '_blank');
      return;
    }
    if (config.theme && config.theme.staticHTML) {
      assetsPath = 'statichtml/';
    } else if (config.theme && config.theme.localTheme && config.theme.localHTML) {
      assetsPath = 'theme/';
    }
    registry.get('dialogs').acknowledgeText(`${assetsPath}privacy`, this.NLSLocalized0.aboutPrivacyHeader);
  },
  validateFirstName() {
    if (this.suFirstname.value.length === 1) {
      this.setStatus(this.firstnameStatus, this.NLSLocalized0.signupToShortName);
    } else {
      this.setStatus(this.firstnameStatus);
    }
  },
  validateEmail() {
    if (this.suUsername.value.length > 0 &&
      (typeof (this.suUsername.checkValidity) === 'function') && !this.suUsername.checkValidity()) {
      this.setStatus(this.emailStatus, this.NLSLocalized0.signupInvalidEmail);
    } else {
      this.setStatus(this.emailStatus);
    }
  },
  validateNationalId() {
    this.setStatus(this.nationalNumberStatus);
    const nationalNumber = this.nationalNumber.value;
    if (nationalNumber.length > 0 && registry.getSiteConfig().nationalIdNumber) {
      if (typeof registry.getSiteConfig().nationalIdNumber === 'string'
        && signinUtils[registry.getSiteConfig().nationalIdNumber]) {
        if (!signinUtils[registry.getSiteConfig().nationalIdNumber](nationalNumber)) {
          mesg = this.NLSLocalized0.nationalNumberError;
          this.setStatus(this.nationalNumberStatus, mesg);
          return false;
        }
        return true;
      }
    }
    return true;
  },
  show() {
    Password.clear();
    m.mount(this.passwordFormNode, PasswordForm('signup', this.check.bind(this)));
    this.check();
    registry.get('addRecaptcha')(this.recaptcha, (val) => {
      this.recaptchaResponse = val;
      this.check();
    }, () => {
      this.recaptchaResponse = null;
      this.check();
    });
    this.dialog.show();
  },
});
