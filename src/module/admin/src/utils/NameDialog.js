import registry from 'commons/registry';
import TitleDialog from 'commons/dialog/TitleDialog';
import { NLSMixin } from 'esi18n';
import { template } from 'lodash-es';
import declare from 'dojo/_base/declare';
import templateString from './NameDialogTemplate.html';

export default declare([TitleDialog.Content, NLSMixin.Dijit], {
  templateString,
  maxWidth: 800,
  nlsBundles: [], // override
  lookUpPath: 'cid?entryname=', // override with the cid needed.
  nlsHeaderTitle: 'nameHeader',
  nlsFooterButtonLabel: 'updateNameButton',

  postCreate() {
    this.inherited(arguments);
    let t;
    const nameSearch = this.nameSearch.bind(this);
    this.nameInput.addEventListener('keyup', () => {
      if (t != null) {
        clearTimeout(t);
      }
      t = setTimeout(nameSearch, 300);
    });
  },

  nameUpdateMessage(state, oldname, newname) {
    let message;
    let cls;
    const bundle = this.NLSBundle0;
    switch (state) {
      case 'hide':
        this.nameMessage.display = 'none';
        return;
      case 'clear':
        message = bundle.nameReset;
        cls = 'alert-info';
        break;
      case 'taken':
        message = bundle.nameTaken;
        cls = 'alert-warning';
        break;
      case 'malformed':
        message = bundle.nameMalformed;
        cls = 'alert-warning';
        break;
      case 'rename':
        message = bundle.nameRename;
        cls = 'alert-info';
        break;
      default:
        break;
    }
    this.nameMessage.innerHTML = template(message)({ name: oldname, newname });
    this.nameMessage.classList.remove('alert-danger');
    this.nameMessage.classList.remove('alert-warning');
    this.nameMessage.classList.remove('alert-info');
    this.nameMessage.classList.add(cls);
    this.nameMessage.style.display = '';
  },

  nameSearch() {
    // TODO check allowed chars
    const oldname = this.entry.getResource(true).getName() || '';
    const newname = this.nameInput.value;
    if (newname === oldname) {
      this.nameUpdateMessage('hide');
      this.checkNewName();
      return;
    }

    if (newname.length > 0 && (newname.toLowerCase() !== newname
      || newname.indexOf(' ') !== -1)) {
      this.nameUpdateMessage('malformed', oldname, newname);
      this.newNameIsOk = false;
      this.checkNewName();
      return;
    }

    if (newname === '') {
      this.newNameIsOk = true;
      if (oldname !== '') {
        this.nameUpdateMessage('clear', oldname, '');
      } else {
        this.nameUpdateMessage('hide');
      }
      this.checkNewName();
      return;
    }
    this.newNameIsOk = false;

    const es = registry.get('entrystore');
    es.getREST().get(es.getBaseURI() + this.lookUpPath + newname)
      .then((data) => {
        if (data.length > 0) {
          this.newNameIsOk = false;
          this.nameUpdateMessage('taken', oldname, newname);
        } else {
          throw Error('No matching entry.');
        }
      })
      .then(null, () => {
        this.newNameIsOk = true;
        this.nameUpdateMessage('rename', oldname, newname);
        this.checkNewName();
      });
  },

  localeChange() {
    this.dialog.updateLocaleStrings(this.NLSBundle0);
  },

  open(params) {
    this.row = params.row;
    this.entry = params.row.entry;
    const name = this.entry.getResource(true).getName() || '';
    this.nameInput.setAttribute('value', name);
    this.nameUpdateMessage('hide');
    this.checkNewName();
    this.dialog.show();
  },

  isSameName() {
    const newname = this.nameInput.value;
    const oldname = this.entry.getResource(true).getName();
    return newname === oldname || (newname === '' && oldname == null);
  },

  checkNewName() {
    if (this.isSameName() || !this.newNameIsOk) {
      this.dialog.lockFooterButton();
    } else {
      this.dialog.unlockFooterButton();
    }
  },

  footerButtonAction() {
    const newname = this.nameInput.value;
    return this.entry.getResource(true).setName(newname).then(() => this.row.render());
  },
});
