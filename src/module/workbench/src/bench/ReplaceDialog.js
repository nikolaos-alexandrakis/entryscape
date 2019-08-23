import htmlUtil from 'commons/util/htmlUtil';
import TitleDialog from 'commons/dialog/TitleDialog';
import EntryType from 'commons/create/EntryType';
import ListDialogMixin from 'commons/list/common/ListDialogMixin';
import eswoReplaceDialog from 'workbench/nls/eswoReplaceDialog.nls';
import declare from 'dojo/_base/declare';
import _WidgetsInTemplateMixin from 'dijit/_WidgetsInTemplateMixin';
import template from './ReplaceDialogTemplate.html';
import './eswoReplaceDialog.css';

export default declare([TitleDialog.ContentNLS, _WidgetsInTemplateMixin, ListDialogMixin], {
  templateString: template,
  bid: 'eswoReplaceDialog',
  maxWidth: 800,
  nlsBundles: [{ eswoReplaceDialog }],
  nlsHeaderTitle: 'replaceFileHeader',
  nlsFooterButtonLabel: 'replaceFileFooterButton',
  postCreate() {
    // Add margin-left 1% somehow to be inline with rdforms.
    const valueChange = (value) => {
      if (this.isFile) {
        this.dialog.unlockFooterButton();
        return;
      }
      if (value != null && (value !== this.oldValue)) {
        this.dialog.unlockFooterButton();
      } else {
        this.dialog.lockFooterButton();
      }
    };
    this.fileOrLink = new EntryType({
      valueChange,
    }, htmlUtil.create('div', null, this.__fileOrLink, true));
    const localeChangeFileOrLink = this.localeChange_fileOrLink.bind(this);
    this.inherited(arguments);
    localeChangeFileOrLink();
  },
  localeChange() {
    if (this.isFile) {
      this.__currentBlock.style.display = 'none';
      this.dialog.titleNode.innerHTML = this.NLSLocalized0.replaceFileHeader;
      this.dialog.footerButtonLabelNode.innerHTML = this.NLSLocalized0.replaceFileFooterButton;
    } else {
      this.__currentBlock.style.display = '';
      this.__currentLabel.innerHTML = this.NLSLocalized0.currentLink;
      this.dialog.titleNode.innerHTML = this.NLSLocalized0.replaceLinkHeader;
      this.dialog.footerButtonLabelNode.innerHTML = this.NLSLocalized0.replaceLinkFooterButton;
    }
  },
  localeChange_fileOrLink() {
    if (this.isFile) {
      this.fileOrLink.__fileLabel.innerHTML = this.NLSLocalized0.newFile;
    } else {
      this.fileOrLink.__linkLabel.innerHTML = this.NLSLocalized0.newLink;
    }
  },

  open(params) {
    this.row = params.row;
    this.entry = params.row.entry;
    this.isLink = false;
    this.isFile = false;
    this.entry.setRefreshNeeded();
    this.entry.refresh().then(() => {
      if (this.entry.isLink()) {
        this.isLink = true;
      } else {
        this.isFile = true;
      }
      // check entry is link or file, display accordingly
      this.fileOrLink.show(this.isFile, this.isLink, false);
      this.localeChange();
      if (this.isLink) {
        this.oldValue = this.entry.getResourceURI();
      } else {
        this.oldValue = this.entry.getEntryInfo().getLabel();
      }
      this.__currentValue.value = this.oldValue;
      this.dialog.show();
    });
    this.inherited(arguments);
  },
  footerButtonAction() {
    if (this.isLink) {
      const entryInfo = this.entry.getEntryInfo();
      const uri = this.fileOrLink.getValue();// check and replace uri
      entryInfo.setResourceURI(uri);
      return entryInfo.commit();
    }
    const inp = this.fileOrLink.getFileInputElement();
    return this.entry.getResource(true).putFile(inp);
  },
});
