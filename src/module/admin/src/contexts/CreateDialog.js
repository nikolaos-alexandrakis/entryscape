import registry from 'commons/registry';
import TitleDialog from 'commons/dialog/TitleDialog';
import ListDialogMixin from 'commons/list/common/ListDialogMixin';
import { NLSMixin } from 'esi18n';
import esadContext from 'admin/nls/esadContext.nls';
import declare from 'dojo/_base/declare';
import _WidgetsInTemplateMixin from 'dijit/_WidgetsInTemplateMixin';
import config from 'config';
import template from './CreateDialogTemplate.html';

export default declare([TitleDialog.ContentNLS, _WidgetsInTemplateMixin, ListDialogMixin, NLSMixin.Dijit], {
  templateString: template,
  maxWidth: 800,
  nlsBundles: [{ esadContext }],
  nlsHeaderTitle: 'newContextnameHeader',
  nlsFooterButtonLabel: 'createContextButton',

  postCreate() {
    this.inherited(arguments);
    if (config.admin && config.admin.showContextName === true) {
      this.contextNameNode.style.display = '';
      let t;
      const contextnameSearch = this.contextNameSearch.bind(this);
      this.contextnameInput.addEventListener('keyup', () => {
        if (t != null) {
          clearTimeout(t);
        }
        t = setTimeout(contextnameSearch, 300);
      });
    }
    this.fullnameInput.addEventListener('keyup', this.checkValidInfoDelayed.bind(this));
  },
  contextNameSearch() {
    // TODO check allowed chars
    this.newNameIsOk = true;

    if (config.admin && config.admin.showContextName === true) {
      const contextname = this.contextnameInput.value;
      if (contextname === '') {
        this.newNameIsOk = true;
        this.contextnameError.style.display = 'none';
        this.checkNewName();
        return;
      }
      this.newNameIsOk = false;
      const es = registry.get('entrystore');
      es.getREST().get(`${es.getBaseURI()}_contexts?entryname=${contextname}`)
        .then((data) => {
          if (data.length > 0) {
            this.newNameIsOk = false;
            this.contextnameError.style.display = '';
            this.contextnameError.innerHTML = this.NLSBundle0.contextnameTaken;
            // domClass.add(this.createContextButton, "disabled");
            this.dialog.lockFooterButton();
          } else {
            throw Error('No matching context.');
          }
        }).then(null, () => {
          this.newNameIsOk = true;
          this.contextnameError.style.display = 'none';
          this.checkValidInfoDelayed();
        });
    }
  },
  /**
   * Clears and resets the form
   *
   * @returns {undefined}
   */
  clearFields() {
    this.contextnameInput.value = '';
    this.fullnameInput.value = '';
    // domClass.add(this.createContextButton, "disabled"); // TODO @scazan What is this doing here?
    this.dialog.lockFooterButton();
  },

  open() {
    this.list.getView().clearSearch();
    this.clearFields();
    this.dialog.show();
  },

  checkValidInfoDelayed() {
    if (this.delayedCheckTimout != null) {
      clearTimeout(this.delayedCheckTimout);
    }

    this.delayedCheckTimeout = setTimeout(this.checkNewName.bind(this), 300);
  },

  checkNewName() {
    const fullname = this.fullnameInput.value;
    if (config.admin && config.admin.showContextName === true) {
      if (fullname === '' || this.newNameIsOk === false) {
        this.dialog.lockFooterButton();
      } else {
        this.dialog.unlockFooterButton();
      }
    } else if (fullname === '' || this.newNameIsOk === false) {
      this.dialog.lockFooterButton();
    } else {
      this.dialog.unlockFooterButton();
    }
  },
  footerButtonAction() {
    const contextname = this.contextnameInput.value;
    const fullname = this.fullnameInput.value;
    // createContext = domAttr.get(this.createContextWithGroup, "checked");
    if (config.admin && config.admin.showContextName === true) {
      if (fullname === '' || this.newNameIsOk === false) {
        return false;
      }
    } else if (fullname === '' || this.newNameIsOk === false) {
      return false;
    }

    /** @type {store/EntryStore} */
    const store = registry.get('entrystore');
    const dialogs = registry.get('dialogs');
    let contextEntry;
    let newEntryId;
    if (contextname && config.admin.setContextNameAsEntryIdOnCreate && registry.get('isAdmin')) {
      newEntryId = contextname;
    }
    const pContextEntry = store.newContext(contextname, newEntryId);
    const md = pContextEntry.getMetadata();
    md.addL(pContextEntry.getResourceURI(), 'dcterms:title', fullname);
    return pContextEntry.commit().then((ue) => {
      contextEntry = ue;
      return contextEntry;
    }).then(ce => ce).then(() => {
      this.list.getView().addRowForEntry(contextEntry);
      this.clearFields();
    }, (err) => {
      if (contextEntry != null) {
        contextEntry.del();
      }
      dialogs.acknowledge(err);
    });
  },
});
