import registry from 'commons/registry';
import TitleDialog from 'commons/dialog/TitleDialog';
import ListDialogMixin from 'commons/list/common/ListDialogMixin';
import { NLSMixin } from 'esi18n';
import esadUser from 'admin/nls/esadUser.nls';
import _WidgetsInTemplateMixin from 'dijit/_WidgetsInTemplateMixin';
import declare from 'dojo/_base/declare';
import template from './CreateDialogTemplate.html';

export default declare([TitleDialog.ContentNLS, _WidgetsInTemplateMixin, ListDialogMixin, NLSMixin.Dijit], {
  templateString: template,
  maxWidth: 800,
  nlsBundles: [{ esadUser }],
  popoverOptions: {},
  nlsHeaderTitle: 'createUserHeader',
  nlsFooterButtonLabel: 'createUserButton',

  postCreate() {
    this.inherited(arguments);

    let t;
    const usernameSearch = this.usernameSearch.bind(this);
    this.usernameInput.addEventListener('keyup', () => {
      if (t != null) {
        clearTimeout(t);
      }
      t = setTimeout(usernameSearch, 300);
    });
    this.firstnameInput.addEventListener('keyup', this.checkValidInfoDelayed.bind(this));
    this.lastnameInput.addEventListener('keyup', this.checkValidInfoDelayed.bind(this));
  },
  usernameSearch() {
    // TODO check allowed chars
    const username = this.usernameInput.value;
    if (username === '') {
      this.usernameError.style.display = 'none';
      return;
    }
    this.newNameIsOk = false;

    const es = registry.get('entrystore');
    es.getREST().get(`${es.getBaseURI()}_principals?entryname=${username}`)
      .then((data) => {
        if (data.length > 0) {
          this.newNameIsOk = false;
          this.usernameError.style.display = '';
          this.usernameError.innerHTML = this.NLSLocalized.esadUser.usernameTaken;
          this.dialog.lockFooterButton();
        } else {
          throw Error('No matching user.');
        }
      }).then(null, () => {
        this.newNameIsOk = true;
        this.usernameError.style.display = 'none';
        this.checkValidInfoDelayed();
      });
  },

  /**
   * Clears and resets the form
   *
   * @returns {undefined}
   */
  clearFields() {
    this.usernameInput.value = '';
    this.firstnameInput.value = '';
    this.lastnameInput.value = '';
    this.dialog.lockFooterButton();
  },

  open() {
    this.list.getView().clearSearch();
    this.clearFields();
    this.dialog.show();
  },

  checkValidInfoDelayed() {
    if (this.delayedCheckTimeout != null) {
      clearTimeout(this.delayedCheckTimeout);
    }

    this.delayedCheckTimeout = setTimeout(this.checkNewName.bind(this), 300);
  },

  checkNewName() {
    const username = this.usernameInput.value;
    const firstname = this.firstnameInput.value;
    const lastname = this.lastnameInput.value;
    if (username === '' || firstname === '' || lastname === '' || this.newNameIsOk === false) {
      this.dialog.lockFooterButton();
    } else {
      this.dialog.unlockFooterButton();
    }
  },
  footerButtonAction() {
    const username = this.usernameInput.value;
    const firstname = this.firstnameInput.value;
    const lastname = this.lastnameInput.value;
    const createContext = this.createContextWithUser.checked;

    if (username === '' || firstname === '' || lastname === '' || this.newNameIsOk === false) {
      return false;
    }
    /** @type {store/EntryStore} */
    const store = registry.get('entrystore');
    const ns = registry.get('namespaces');
    const dialogs = registry.get('dialogs');
    let userEntry;
    let contextEntry;

    const pue = store.newUser(username);
    const md = pue.getMetadata();
    const resURI = pue.getResourceURI();
    const guestURI = store.getResourceURI('_principals', '_guest');
    md.add(pue.getResourceURI(), ns.expand('foaf:givenName'),
      { type: 'literal', value: firstname });
    md.add(pue.getResourceURI(), ns.expand('foaf:familyName'),
      { type: 'literal', value: lastname });
    md.add(pue.getResourceURI(), ns.expand('foaf:name'),
      { type: 'literal', value: `${firstname} ${lastname}` });
    pue.getEntryInfo().setACL({
      mread: [guestURI],
      rread: [guestURI],
      mwrite: [resURI],
      rwrite: [resURI],
    });

    return pue.commit().then((ue) => {
      userEntry = ue;
      if (createContext) {
        const cpe = store.newContext();
        cpe.getEntryInfo().setACL({ admin: [userEntry.getResourceURI()] });
        return cpe.commit();
      }
      return userEntry;
    }).then((ce) => {
      if (createContext) {
        contextEntry = ce;
        return userEntry.getResource(true).setHomeContext(contextEntry.getId()).then(() => {
          contextEntry.setRefreshNeeded();
          return contextEntry.refresh();
        });
      }
      return ce;
    }).then(() => {
      // Everything worked!
      this.list.getView().addRowForEntry(userEntry);
      this.clearFields();
    }, (err) => {
      // Something did not work, try to clean up.
      if (userEntry != null) {
        userEntry.del();
      }
      if (contextEntry != null) {
        contextEntry.del();
      }

      dialogs.acknowledge(err);
    });
  },
});
