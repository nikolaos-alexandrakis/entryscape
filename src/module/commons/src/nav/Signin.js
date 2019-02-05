import esadUser from 'admin/nls/esadUser.nls';
import TitleDialog from 'commons/dialog/TitleDialog';
import PasswordReset from 'commons/nav/PasswordReset';
import Signup from 'commons/nav/Signup';
import escoSignin from 'commons/nls/escoSignin.nls';
import registry from 'commons/registry';
import PublicView from 'commons/view/PublicView';
import config from 'config';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import _WidgetBase from 'dijit/_WidgetBase';
import declare from 'dojo/_base/declare';
import { i18n, NLSMixin } from 'esi18n';
import m from 'mithril';
import configUtil from '../util/configUtil';
import DOMUtil from '../util/htmlUtil';

import Logo from './components/Logo';
import './escoSignin.css';
import template from './SigninTemplate.html';

let signup;
let resetPassword;

const SigninMixin = declare([PublicView], {
  nlsBundles: [{ escoSignin }],
  templateString: template,
  bid: 'escoSignin',

  postCreate() {
    this.inherited(arguments);
    this.renderLogo();
    if (config.entrystore.internalsignin !== false || window.queryParamsMap.internal === true) {
      this.domNode.classList.add(`${this.bid}--internal`);
    }
  },
  renderLogo() {
    const logoInfo = configUtil.getLogoInfo();
    m.render(this[`${this.bid}__home`], m(Logo, logoInfo));
  },
  updateExternalSignInOption() {
    const ces = config.entrystore.externalsignin;
    if (ces) {
      this.domNode.classList.add(`${this.bid}--external`);
      if (ces.icon) {
        this.__externalImage.setAttribute('src', ces.icon);
        if (ces.iconAlt) {
          this.__externalImage.setAttribute('src', registry.get('localize')(ces.iconAlt));
        }
      } else {
        this.__externalImage.style.display = 'none';
      }
      if (ces.message) {
        this.__externalMessage.innerHTML = registry.get('localize')(ces.message);
      }
      const es = registry.get('entrystore');
      const site = registry.getSiteManager();
      let { nextView, nextViewParams } = site.getState();
      if (!nextView || (nextView && nextView === this.params.view)) {
        nextView = registry.getSiteConfig().startView; // Fix to avoid infinite loops
        nextViewParams = this.params.params;
      }
      const successURL = encodeURIComponent(`${config.baseUrl}${site.getViewPath(nextView, nextViewParams)}`);
      const failureURL = encodeURIComponent(`${config.baseUrl}${site.getViewPath(registry.getSiteConfig().signinView)}`);
      this.__externalButton.setAttribute('href', `${es.getBaseURI()}auth/cas?redirectOnSuccess=${successURL}&redirectOnFailure=${failureURL}`);
    }
  },
  footerButtonAction() {
    if (!this.isFormValid(this.signinForm)) {
      return this.NLSBundle0.signinUnauthorized;
    }
    const esUser = this.username.value;
    const esPassword = window.encodeURI(this.password.value);
    const auth = registry.get('entrystore').getAuth();
    const async = registry.get('asynchandler');
    async.addIgnore('login', async.codes.UNAUTHORIZED, true);
    return auth.login(esUser, esPassword)
      .then(() => {
        this.signinForm.reset();
      })
      .catch((err) => {
        if (err.response.status === 401) {
          throw Error(this.NLSBundle0.signinUnauthorized);
        } else if (err.response.status === 403) {
          throw Error(i18n.localize(esadUser, 'userStatusDisabled'));
        } else {
          throw Error(this.NLSBundle0.signinError);
        }
      });
  },
  signin() {
    PubSub.publish('app.signin');
  },
  signout() {
    PubSub.publish('app.signout');
  },
  start() {
    PubSub.publish('app.start');
  },
  showSignupDialog() {
    signup.show();
  },
  showPWResetDialog() {
    resetPassword.show();
  },
  isFormValid(form) {
    if (typeof (form.checkValidity) === 'function') {
      return form.checkValidity();
    }
    return true;
  },

});

const Signin = declare([_WidgetBase, _TemplatedMixin, NLSMixin.Dijit, SigninMixin], {
  nlsHeaderTitle: 'signInHeader',
  nlsFooterButtonLabel: 'signInButton',
  maxWidth: 800,
  nextView: '',
  show(params) {
    this.params = params;
    this.setStatus();
    this.updateExternalSignInOption();
  },
  postCreate() {
    this.inherited('postCreate', arguments);
    this.password.onkeypress = (ev) => {
      if (ev.key === 'Enter') {
        ev.preventDefault();
        ev.stopPropagation();
        this.signin();
      }
    };

    if (config.site && registry.getSiteConfig().signup !== false) {
      this.showSignupButton.style.display = '';
    }

    const setCSSClasses = (user) => {
      this.setStatus();
      if (user != null) {
        this.domNode.classList.add(`${this.bid}--signout`);
      } else {
        this.domNode.classList.remove(`${this.bid}--signout`);
      }
    };

    registry.onChange('authorizedUser', setCSSClasses, true);

    const displayHeader = (info) => {
      if (info.displayName) {
        this.signedInHeaderNode.innerHTML = i18n.localize(escoSignin, 'signedInHeader', { name: info.displayName });
      }
    };

    registry.onChange('userEntryInfo', displayHeader, true);
  },
  signin() {
    const p = this.footerButtonAction();
    if (p instanceof Promise) {
      p.then(() => {
        const site = registry.getSiteManager();
        let { nextView, nextViewParams } = site.getState();
        if (!nextView || (nextView && nextView === this.params.view)) {
          nextView = registry.getSiteConfig().startView; // Fix to avoid infinite loops
          nextViewParams = this.params.params;
        }
        if (nextView) {
          /**
           * Open the next view only when userEntryInfo is set
           */
          registry.onChangeOnce('userEntryInfo', () => {
            registry.get('siteManager').render(nextView, nextViewParams);
          });
        }
      }, this.setStatus.bind(this));
    } else if (typeof p === 'string') {
      this.setStatus(p);
    }
    this.inherited('signin', arguments);
  },
  signout() {
    return registry.get('entrystore').getAuth().logout().then(() => {
      this.inherited('signout', arguments);
      this.start();
    });
  },
  start() {
    const siteConfig = registry.getSiteConfig();
    registry.get('siteManager').render(siteConfig.startView);
    this.inherited('start', arguments);
  },
  setStatus(message) {
    if (message) {
      this.signinStatusWrapper.style.display = '';
      this.signinStatus.innerHTML = message;
    } else {
      this.signinStatusWrapper.style.display = 'none';
    }
  },
});

Signin.Dialog = declare([TitleDialog.ContentNLS, SigninMixin], {
  nlsHeaderTitle: 'signInHeader',
  nlsFooterButtonLabel: 'signInButton',
  maxWidth: 800,
  show() {
    this.signinStatus.innerHTML = '';
    this.updateExternalSignInOption();
    this.dialog.show();
  },
  postCreate() {
    this.inherited('postCreate', arguments);
    this.password.onkeypress = (ev) => {
      if (ev.key === 'Enter') {
        ev.preventDefault();
        ev.stopPropagation();
        this.dialog.footerButtonClick();
      }
    };
    this.domNode.classList.add('signindialog');
    // TODO remove site.signup in next version, this is for compatability with old configs
    if (registry.getSiteConfig().signup !== false && config.entrystore.signup !== false) {
      this.showSignupButton.style.display = '';
    }

    if (!signup) {
      signup = new Signup({}, null, DOMUtil.create('div', null, this.domNode));
      resetPassword = new PasswordReset({}, null, DOMUtil.create('div', null, this.domNode));
      registry.set('signInDialog', this);
      registry.set('signUpDialog', signup);
    }
  },
});


export default Signin;
