import SideDialog from './SideDialog';
import template from './HeaderDialogTemplate.html';
import DOMUtil from '../util/htmlUtil';
import declare from 'dojo/_base/declare';
import _WidgetBase from 'dijit/_WidgetBase';
import _TemplatedMixin from 'dijit/_TemplatedMixin';

const HeaderDialog = declare([SideDialog], {
  templateString: template,
  moveOfHeaderAndFooter: true,
  postCreate() {
    this.inherited('postCreate', arguments);
    this.close.onclick = this.conditionalHide.bind(this);
    this.moveHeaderAndFooter();
  },
  moveHeaderAndFooter() {
    const headerNode = this.containerNode.querySelector('header');
    if (headerNode) {
      headerNode.appendChild(this.headerExtentionNode);
      this.domNode.classList.add('spaHeader');
    }
    const footerNode = this.containerNode.querySelector('footer');
    if (footerNode) {

      footerNode.appendChild(this.footerExtentionNode);
      this.domNode.classList.add('spaFooter');
    }
  },
});

HeaderDialog.Content = declare([_WidgetBase, _TemplatedMixin], {
  templateString: '<h1>Override me!</h1>',

  buildRendering() {
    const dialogNode = this.srcNodeRef || DOMUtil.create('div');
    const params = SideDialog.createParams(this, ['indent', 'firstIndent', 'maxWidth']);
    params.moveOfHeaderAndFooter = false;
    this.dialog = new HeaderDialog(params, dialogNode);
    this.srcNodeRef = DOMUtil.create('div', null, this.dialog.containerNode);
    this.inherited(arguments);
    if (this.dialogClass) {
      this.dialog.domNode.classList.add(this.dialogClass);
    }
  },
  postCreate() {
    this.dialog.moveHeaderAndFooter();
  },
});

export default HeaderDialog;
