import ListDialogMixin from 'commons/list/common/ListDialogMixin';
import TitleDialog from 'commons/dialog/TitleDialog';
import htmlUtil from 'commons/util/htmlUtil';
import { NLSMixin } from 'esi18n';
import esteTerminology from 'terms/nls/esteTerminology.nls';
import declare from 'dojo/_base/declare';
import _WidgetsInTemplateMixin from 'dijit/_WidgetsInTemplateMixin';
import ImportTerminology from './ImportTerminology';
import CreateTerminology from './CreateTerminology';
import templateString from './CreateTerminologyDialogTemplate.html';

export default declare([TitleDialog.ContentNLS, _WidgetsInTemplateMixin, ListDialogMixin, NLSMixin.Dijit], {
  templateString,
  maxWidth: 800,
  nlsBundles: [{ esteTerminology }],
  nlsHeaderTitle: 'createTerminology',
  nlsFooterButtonLabel: 'createTerminologyButton',

  postCreate() {
    this.inherited(arguments);
    // domConstruct.place(this.__chooserHeader, this.dialog.headerExtensionNode);
    this.dialog.headerExtensionNode.appendChild(this.__chooserHeader);
    this.importTerminology = new ImportTerminology({
      list: this.list,
      dialog: this.dialog,
    }, htmlUtil.create('div', null, this.__importNode));
    this.createTerminology = new CreateTerminology({
      list: this.list,
      dialog: this.dialog,
    }, htmlUtil.create('div', null, this.__createNode));
  },
  open() {
    this.inherited(arguments);
    this.createTerminology.clear();
    this.importTerminology.init();
    this.dialog.show();
  },
  footerButtonAction() {
    const importTerminology = this.__importTab.classList.contains('active');
    return importTerminology ? this.importTerminology.footerButtonClick() :
      this.createTerminology.footerButtonAction();
  },
  importT() {
    this.importTerminology.init();

    this.__importNode.style.display = 'block';
    this.__importTab.classList.add('active');

    this.__createNode.style.display = 'none';
    this.__createTab.classList.remove('active');
  },
  createT() {
    this.createTerminology.clear();

    this.__importNode.style.display = 'none';
    this.__importTab.classList.remove('active');

    this.__createNode.style.display = 'block';
    this.__createTab.classList.add('active');
  },
});
