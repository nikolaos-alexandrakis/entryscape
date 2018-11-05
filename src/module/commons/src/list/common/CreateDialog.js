import {isArray} from 'lodash-es';
import {i18n} from 'esi18n';
import {createEntry} from 'commons/util/storeUtil';
import ListDialogMixin from './ListDialogMixin';
import RDFormsEditDialog from '../../rdforms/RDFormsEditDialog';
/**
 * Dialog for creating new entries. Uses the lists entryType (if present) to set a type.
 * Uses the list specific bundle to get a title and button label via the keys "createHeader" and
 * "createButton" respectively.
 */
import declare from 'dojo/_base/declare';

export default declare([RDFormsEditDialog, ListDialogMixin], {
  explicitNLS: true,
  open() {
    this.inherited(arguments);
    this.list.getView().clearSearch();
    this.updateGenericCreateNLS();
    this._newEntry = createEntry();
    const nds = this._newEntry;
    let et = this.list.entryType;
    et = isArray(et) ? et[0] : et;
    if (et) {
      nds.getMetadata().add(nds.getResourceURI(), 'rdf:type', et, true);
    }
    this.editor.hideAddress = true;
    this.show(nds.getResourceURI(), nds.getMetadata(),
      this.list.getTemplate(), this.list.getTemplateLevel());
  },
  updateGenericCreateNLS() {
    const bundle = this.list.nlsSpecificBundle.createHeader ?
      this.list.nlsSpecificBundle : this.list.nlsGenericBundle;
    const name = this.list.getName();
    this.title = i18n.renderNLSTemplate(bundle.createHeader, name);
    this.doneLabel = i18n.renderNLSTemplate(bundle.createButton, name);
    this.updateTitleAndButton();
  },
  doneAction(graph) {
    return this._newEntry.setMetadata(graph).commit().then(function (newEntry) {
      this.list.addRowForEntry(newEntry);
    }.bind(this));
  },
});
