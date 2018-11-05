import template from './CreateTerminologyDialogTemplate.html';
import ListDialogMixin from 'commons/list/common/ListDialogMixin';
import TitleDialog from 'commons/dialog/TitleDialog';
import htmlUtil from 'commons/util/htmlUtil';
import ImportTerminology from './ImportTerminology';
import CreateTerminology from './CreateTerminology';
import {NLSMixin} from 'esi18n';
import esteTerminology from 'terms/nls/esteTerminology.nls';
import declare from 'dojo/_base/declare';
import _WidgetsInTemplateMixin from 'dijit/_WidgetsInTemplateMixin';

export default declare([TitleDialog.ContentNLS, _WidgetsInTemplateMixin, ListDialogMixin, NLSMixin.Dijit], {
  templateString: template,
  maxWidth: 800,
  nlsBundles: [{esteTerminology}],
  nlsHeaderTitle: 'createTerminology',
  nlsFooterButtonLabel: 'createTerminologyButton',

  postCreate() {
    this.inherited(arguments);
    this.dialog.headerExtensionNode.appendChild(this.__chooserHeader); // domConstruct.place(this.__chooserHeader, this.dialog.headerExtensionNode);
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
    this.__createNode.style.display = 'none';
    this.__importTab.classList.toggle('active');
    this.__createTab.classList.toggle('active');
  },
  createT() {
    this.createTerminology.clear();
    this.__importNode.style.display = 'none';
    this.__createNode.style.display = 'block';
    this.__importTab.classList.toggle('active');
    this.__createTab.classList.toggle('active');
  },
});
