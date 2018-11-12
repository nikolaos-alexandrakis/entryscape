import TitleDialog from 'commons/dialog/TitleDialog';
import ListDialogMixin from 'commons/list/common/ListDialogMixin';
import { NLSMixin } from 'esi18n';
import escaEmbed from 'catalog/nls/escaEmbed.nls';
import declare from 'dojo/_base/declare';
import _WidgetsInTemplateMixin from 'dijit/_WidgetsInTemplateMixin';
import EmbedPreview from './EmbedPreview';
import template from './EmbedDialogTemplate.html';

import './escaEmbedDialog.css';

export default declare([TitleDialog.ContentNLS, _WidgetsInTemplateMixin, ListDialogMixin, NLSMixin.Dijit], {
  templateString: template,
  nlsBundles: [{ escaEmbed }],
  maxWidth: 800,
  nlsHeaderTitle: 'embedHeader',
  includeFooter: false,
  bid: 'escaEmbedDialog',
  postCreate() {
    this.inherited(arguments);
    this.previewDialog = new EmbedPreview({}, this.__dialogContainer);
  },
  open(params) {
    this.inherited(arguments);
    this.entry = params.row.entry;
    this.repobase = `${document.location.protocol}//${document.location.host}`;
    this.entryId = this.entry.getId();
    this.ctxId = this.entry.getContext().getId();
    this.blank = 'data-target="_blank"';
    this.themeStyle = 'FA';
    this.setEmbededText();
    this.dialog.show();
  },
  imgOption(e) {
    this.themeStyle = 'IMG';
    this.setEmbededText();
    this.updateUI(e);
  },
  faOption(e) {
    this.themeStyle = 'FA';
    this.setEmbededText();
    this.updateUI(e);
  },
  updateUI(e) {
    const activeA = document.querySelector('.theme-formats a.active');
    if (activeA.length > 0) {
      activeA[0].classList.remove('active');
    }
    e.currentTarget.classList.add('active');
  },
  setOpenTab(event) {
    const target = event.target || event.srcElement;
    this.blank = '';
    if (target.checked) {
      this.blank = 'data-target="_blank"';
    }
    this.setEmbededText();
  },
  setEmbededText() {
    this.embededTxt = `<script src="https://static.entryscape.com/embed/catalog/latest/embed.js"
               data-entry-id="${this.entryId}" data-context-id="${this.ctxId}" data-theme-style="${this.themeStyle}"
               data-repository="${this.repobase}" ${this.blank}></script>`;
    this.embededTxtWithAuth = `<script src="https://static.entryscape.com/embed/catalog/latest/embed.js"
               data-entry-id="${this.entryId}" data-context-id="${this.ctxId}" data-theme-style="${this.themeStyle}"
               data-repository="${this.repobase}" data-ignore-auth="false" ${this.blank}></script>`;

    this.__embedInput.setAttribute('value', this.embededTxt);
  },
  preview() {
    this.previewDialog.open({
      embededCode: this.embededTxtWithAuth,
      eid: this.entryId,
      cid: this.ctxId,
      theme: this.themeStyle,
      base: this.repobase,
    });
  },
});
