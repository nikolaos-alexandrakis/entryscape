import ListDialogMixin from 'commons/list/common/ListDialogMixin';
import TitleDialog from 'commons/dialog/TitleDialog';
import registry from 'commons/registry';
import esadUser from 'admin/nls/esadUser.nls';
import declare from 'dojo/_base/declare';
import template from './UsernameDialogTemplate.html';

export default declare([TitleDialog.ContentNLS, ListDialogMixin], {
  templateString: template,
  maxWidth: 800,
  nlsBundles: [{ esadUser }],
  popoverOptions: {},
  nlsHeaderTitle: 'changeUsernameHeader',
  nlsFooterButtonLabel: 'changeUsernameButton',

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
  },
  usernameSearch() {
    // TODO check allowed chars
    const username = this.usernameInput.value;
    if (username === '' || username === this.currentUsername) {
      this.usernameError.style.display = 'none';
      this.dialog.lockFooterButton();
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
        this.dialog.unlockFooterButton();
      });
  },

  /**
   * Clears all fields from the form
   *
   * @returns {UserNameDialog}
   */
  clearFields() {
    this.usernameInput.value = '';
    this.dialog.lockFooterButton();

    return this;
  },

  open() {
    this.inherited(arguments);
    this.clearFields();
    this.dialog.show();
    this.row.entry.getResource().then((user) => {
      this.currentUsername = user.getName();
      this.currentUserName.value = this.currentUsername;
    });
  },

  footerButtonAction() {
    const username = this.usernameInput.value;
    if (username === '' || this.newNameIsOk === false) {
      return false;
    }

    return this.row.entry.getResource()
      .then(user => user.setName(username))
      .then(() => {
        this.list.rowMetadataUpdated.bind(this.list, this.row);
        this.clearFields();
      });
  },
});
