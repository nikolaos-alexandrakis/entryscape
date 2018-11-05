import jquery from 'jquery';
import ListDialogMixin from '../list/common/ListDialogMixin';
import templateString from './ExportTemplate.html';
import TitleDialog from '../dialog/TitleDialog';
import {i18n, NLSMixin} from 'esi18n';

import declare from 'dojo/_base/declare';
import _WidgetsInTemplateMixin from 'dijit/_WidgetsInTemplateMixin';

export default declare([TitleDialog.ContentNLS, _WidgetsInTemplateMixin, ListDialogMixin, NLSMixin.Dijit], {
  templateString,
  maxWidth: 800,
  format: '',
  includeFooter: false,
  nlsExportText: 'exportText',
  nlsDownloadButton: 'downloadButton',
  // nlsDownloadLabel: null,
  nlsFormatSelect: 'exportFormatSelect',

  localeChange() {
    const bundle = this.NLSBundle0;
    this.exportText.innerHTML = bundle[this.nlsExportText];
    this.downloadButton.innerHTML = bundle[this.nlsDownloadButton];
    this.exportFormatSelect.innerHTML = bundle[this.nlsFormatSelect];
    // if (this.downloadLabel) {
    //  domAttr.set(this.downloadLabel, 'innerHTML', bundle[this.nlsDownloadLabel]);
    //  domStyle.set(this.downloadLabel, 'display', '');
    // }
    this.inherited(arguments);
  },

  rdfxmlClick(e) {
    // This is the default from EntryStore, optionally we could set application/rdf+xml
    this.format = '';
    this.update(e);
  },

  turtleClick(e) {
    this.format = 'text/turtle';
    this.update(e);
  },

  ntriplesClick(e) {
    this.format = 'text/n-triples';
    this.update(e);
  },

  jsonldClick(e) {
    this.format = 'application/ld+json';
    this.update(e);
  },

  downloadClick() {
    const mdUri = `${this.entry.getEntryInfo().getMetadataURI()}?recursive=${this.profile}&download`;
    const format = this.format !== '' ? `&format=${this.format}` : '';
    window.open(mdUri + format, '_blank');
  },

  update(e) {
    const mdUri = this.entry.getEntryInfo().getMetadataURI();
    const format = this.format !== '' ? `&format=${this.format}` : '';
    this.exportUrl.setAttribute('value', `${mdUri}?recursive=${this.profile}${format}`);
    if (e) {
      this.updateUI(e);
    }
  },

  updateUI(e) {
    const activeA = jquery('.download-formats a.active');
    if (activeA.length > 0) {
      domClass.remove(activeA[0], 'active');
    }

    domClass.add(e.currentTarget, 'active');
  },

  open(params) {
    this.entry = params.row.entry;
    this.update();
    this.dialog.show();
  },
});
