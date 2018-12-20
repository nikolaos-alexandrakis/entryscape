import { i18n, NLSMixin } from 'esi18n';
import escoLayout from 'commons/nls/escoLayout.nls';
import TitleDialog from 'commons/dialog/TitleDialog'; // In template
import PasswordForm from 'commons/auth/components/PasswordForm';
import Password from 'commons/auth/Password';
import PubSub from 'pubsub-js';
import config from 'config';
import registry from 'commons/registry';
import m from 'mithril';
import declare from 'dojo/_base/declare';
import template from './SettingsTemplate.html';
import DOMUtil from '../util/htmlUtil';


export default declare([TitleDialog.ContentNLS, NLSMixin.Dijit], {
  templateString: template,
  nlsBundles: [{ escoLayout }],
  nlsHeaderTitle: 'settingsHeader',
  nlsFooterButtonTitle: 'saveSettings',
  nlsFooterButtonLabel: 'saveSettings',

  postCreate() {
    this.inherited('postCreate', arguments);
    DOMUtil.create('option', { value: '' }, this.settingsLanguage);
    const sortedSuppLangs = this.sortLanguages(config.locale.supported);
    sortedSuppLangs.forEach((l) => {
      DOMUtil.create('option', {
        value: l.lang,
      }, this.settingsLanguage).innerHTML = l.label;
    });
    const update = this.updateFooterButton.bind(this);
    this.settingsFirstname.onkeyup = update;
    this.settingsLastname.onkeyup = update;
    this.settingsLanguage.onchange = update;
  },

  show() {
    this.dialog.show();
    Password.clear();
    m.mount(this.passwordFormNode, PasswordForm('settings', this.updateFooterButton.bind(this)));
    this.settingsFormStatus.innerHTML = '';
    const info = registry.get('userEntryInfo');
    const customProperties = registry.get('userEntry').getResource(true).getCustomProperties();
    if (info) {
      this.settingsUsername.value = info.user;
      this.settingsLastname.value = info.lastName ? info.lastName : '';
      this.settingsFirstname.value = info.firstName ? info.firstName : '';
      this.settingsLanguage.value = info.language ? info.language : '';

      if (registry.getSiteConfig().nationalIdNumber) {
        this.nationalNumberNode.style.display = '';
        this.settingNationalNumber.value = customProperties.nationalid || '';
      }
    } else {
      const dialogs = registry.get('dialogs');
      dialogs.acknowledge(this.nlsBundle0.noSettingsError);
    }
    this.dialog.lockFooterButton();
  },
  formReset() {
    this.settingsForm.reset();
  },
  showSettingsError(message) {
    const oldStatus = this.settingsFormStatus.innerHTML;
    this.settingsFormStatus.innerHTML = `${oldStatus}<div class="alert alert-danger" role="alert">${message}</div>`;
  },

  /**
   * Sorts the languages based on its label.
   * @param supportedLangNames
   * @returns {Array}
   */
  sortLanguages(supportedLangNames) {
    const label2langNames = supportedLangNames.map(supportedLang => ({
      lang: supportedLang,
      label: supportedLang.label.toLowerCase(),
    }));
    // sort by label
    label2langNames.sort((a, b) => {
      if (a.label < b.label) {
        return -1;
      } else if (a.label > b.label) {
        return 1;
      }
      return 0;
    });
    return label2langNames.map(label2langName => label2langName.lang);
  },
  updateFooterButton() {
    const firstName = this.settingsFirstname.value.trim();
    const lastName = this.settingsLastname.value.trim();
    const language = this.settingsLanguage.value;

    if (Password.canSubmit() && firstName.length > 0
      && lastName.length > 0 && language.length > 0) {
      this.dialog.unlockFooterButton();
    } else {
      this.dialog.lockFooterButton();
    }
  },
  footerButtonAction() {
    const bundle = this.NLSBundle0;
    this.settingsFormStatus.innerHTML = '';

    let firstName = this.settingsFirstname.value.trim();
    let lastName = this.settingsLastname.value.trim();
    const language = this.settingsLanguage.value;

    if (firstName.length === 0) {
      return bundle.firstNameMissing;
    }

    if (lastName.length === 0) {
      return bundle.lastNameMissing;
    }

    const auth = registry.get('entrystore').getAuth();
    const saveOps = [];

    if (Password.provided()) {
      saveOps.push(auth.getUserEntry()
        .then(userEntry => userEntry.getResource(true).setPassword(Password.password), () => bundle.passwordSaveError));
    }

    if (language.length === 2) {
      saveOps.push(auth.getUserEntry()
        .then(userEntry => userEntry.getResource(true).setLanguage(language)), () => bundle.languageSaveError);
      i18n.setLocale(language);
    }

    saveOps.push(auth.getUserEntry().then((userEntry) => {
      firstName = this.settingsFirstname.value;
      lastName = this.settingsLastname.value;

      if (firstName && lastName && (firstName.trim().length > 0)
        && (lastName.trim().length > 0)) {
        const graph = userEntry.getMetadata();

        graph.findAndRemove(null, 'http://xmlns.com/foaf/0.1/firstName', null);
        graph.findAndRemove(null, 'http://xmlns.com/foaf/0.1/givenName', null);
        graph.add(userEntry.getResourceURI(),
          'http://xmlns.com/foaf/0.1/givenName',
          { type: 'literal', value: firstName.trim() });

        graph.findAndRemove(null, 'http://xmlns.com/foaf/0.1/lastName', null);
        graph.findAndRemove(null, 'http://xmlns.com/foaf/0.1/familyName', null);
        graph.add(userEntry.getResourceURI(),
          'http://xmlns.com/foaf/0.1/familyName',
          { type: 'literal', value: lastName.trim() });

        userEntry.commitMetadata().then(() => {
          registry.set('userEntry', userEntry);
        });
      }
    }, () => bundle.settingsSaveError));

    return Promise.all(saveOps).then(() => {
      this.formReset();
      PubSub.publish('dcatmanager/user');
    }, () => {
      PubSub.publish('dcatmanager/user');
      return bundle.settingsSaveError;
    });
  },
});
