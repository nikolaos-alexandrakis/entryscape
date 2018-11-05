import TitleDialog from 'commons/dialog/TitleDialog';
import ListDialogMixin from 'commons/list/common/ListDialogMixin';
import htmlUtil from 'commons/util/htmlUtil';
import {i18n, NLSMixin} from 'esi18n';
import escaEmbedPreview from 'catalog/nls/escaEmbedPreview.nls';
import declare from 'dojo/_base/declare';
import _WidgetBase from 'dijit/_WidgetBase';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import _WidgetsInTemplateMixin from 'dijit/_WidgetsInTemplateMixin';
import './escaEmbedPreview.css';

export default declare([TitleDialog.ContentNLS, ListDialogMixin], {
  maxWidth: 800,
  nlsBundles: [{escaEmbedPreview}],
  nlsHeaderTitle: 'embedPreviewHeader',
  includeFooter: false,
  bid: 'escaEmbedPreview',
  postCreate() {
    this.dialog.containerNode.style.height = '100%';
    this.dialog.containerNode.innerHTML = '';
    this.inherited(arguments);
  },
  open(params) {
    this.inherited(arguments);
    if (this.iframe) {
      this.iframe.remove();
    }
    this.iframe = htmlUtil.create('iframe', {class: `${this.bid}__embedCode`}, this.dialog.containerNode);
    const embedCode = params.embededCode;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${embedCode}</body></html>`;
    setTimeout(() => {
      this.iframe.contentWindow.document.open();
      this.iframe.contentWindow.document.write(html);
      this.iframe.contentWindow.document.close();
    }, 1);
    this.dialog.show();
  },
});
