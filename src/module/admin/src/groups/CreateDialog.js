import registry from 'commons/registry';
import TitleDialog from 'commons/dialog/TitleDialog';
import ListDialogMixin from 'commons/list/common/ListDialogMixin';
import config from 'config';
import { NLSMixin } from 'esi18n';
import esadGroup from 'admin/nls/esadGroup.nls';
import declare from 'dojo/_base/declare';
import _WidgetsInTemplateMixin from 'dijit/_WidgetsInTemplateMixin';
import template from './CreateDialogTemplate.html';

export default declare([TitleDialog.ContentNLS, _WidgetsInTemplateMixin, ListDialogMixin, NLSMixin.Dijit], {
  templateString: template,
  maxWidth: 800,
  nlsBundles: [{ esadGroup }],
  nlsHeaderTitle: 'createGroupHeader',
  nlsFooterButtonLabel: 'createGroupButton',

  postCreate() {
    this.inherited(arguments);
    this.dialog.lockFooterButton();
    if (config.admin && config.admin.showGroupName === true) {
      this.groupNameNode.style.display = '';
      let t;
      const groupnameSearch = this.usernameSearch.bind(this);
      this.groupnameInput.addEventListener('keyup', () => {
        if (t != null) {
          clearTimeout(t);
        }
        t = setTimeout(groupnameSearch, 300);
      });
    }

    this.fullnameInput.addEventListener('keyup', this.checkValidInfoDelayed.bind(this));
  },
  usernameSearch() {
    this.newGroupnameIsOk = true;
    if (config.admin && config.admin.showGroupName === true) {
      // TODO check allowed chars
      const groupname = this.groupnameInput.value;
      if (groupname === '') {
        this.newGroupnameIsOk = true;
        this.groupnameError.style.display = 'none';
        this.checkNewName();
        return;
      }
      this.newGroupnameIsOk = false;

      const es = registry.get('entrystore');
      es.getREST().get(`${es.getBaseURI()}_principals?entryname=${groupname}`)
        .then((data) => {
          if (data.length > 0) {
            this.newGroupnameIsOk = false;
            this.groupnameError.style.display = '';
            this.groupnameError.innerHTML = this.NLSBundles.esadGroup.groupnameTaken;
            // domClass.add(this.createGroupButton, "disabled");
            this.dialog.lockFooterButton();
          } else {
            throw Error('No matching group.');
          }
        }).then(null, () => {
          this.newGroupnameIsOk = true;
          this.groupnameError.style.display = 'none';
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
    this.groupnameInput.value = '';
    this.fullnameInput.value = '';
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
    if (config.admin && config.admin.showGroupName === true) {
      const fullname = this.fullnameInput.value;
      if (fullname === '' || this.newGroupnameIsOk === false) {
        this.dialog.lockFooterButton();
      } else {
        this.dialog.unlockFooterButton();
      }
    } else {
      const fullname = this.fullnameInput.value;
      if (fullname === '' || this.newGroupnameIsOk === false) {
        this.dialog.lockFooterButton();
      } else {
        this.dialog.unlockFooterButton();
      }
    }
  },
  footerButtonAction() {
    const groupname = this.groupnameInput.value;
    const fullname = this.fullnameInput.value;
    const createContext = this.createContextWithGroup.getAttribute('checked');
    if (config.admin && config.admin.showGroupName === true) {
      if (fullname === '' || this.newGroupnameIsOk === false) {
        return false;
      }
    } else if (fullname === '' || this.newGroupnameIsOk === false) {
      return false;
    }
    /** @type {store/EntryStore} */
    const store = registry.get('entrystore');
    const ns = registry.get('namespaces');
    const dialogs = registry.get('dialogs');
    let groupEntry;
    let contextEntry;

    let pue;
    if (config.admin && config.admin.setGroupNameAsEntryIdOnCreate && registry.get('isAdmin')) {
      pue = store.newGroup(groupname, groupname);
    } else {
      pue = store.newGroup(groupname);
    }
    const md = pue.getMetadata();
    md.add(pue.getResourceURI(), ns.expand('foaf:name'),
      { type: 'literal', value: fullname });
    return pue.commit().then((ue) => {
      groupEntry = ue;
      if (createContext) {
        let cpe;
        if (groupname && config.admin.setContextNameAsEntryIdOnCreate) {
          cpe = store.newContext(groupname, groupname);
        } else {
          cpe = store.newContext();
        }
        cpe.getEntryInfo().setACL({ admin: [groupEntry.getResourceURI()] });
        return cpe.commit();
      }
      return groupEntry;
    }).then((ce) => {
      if (createContext) {
        contextEntry = ce;
        return groupEntry.getResource(true).setHomeContext(contextEntry.getId()).then(() => {
          contextEntry.setRefreshNeeded();
          return contextEntry.refresh();
        });
      }
      return ce;
    }).then(() => {
      // Everything worked!
      this.list.getView().addRowForEntry(groupEntry);
      this.clearFields();
    }, (err) => {
      // Something did not work, try to clean up.
      if (groupEntry != null) {
        groupEntry.del();
      }
      if (contextEntry != null) {
        contextEntry.del();
      }
      dialogs.acknowledge(err);
    });
  },
});
