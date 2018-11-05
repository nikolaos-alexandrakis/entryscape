import m from 'mithril';
import jquery from 'jquery';
import template from './ProgressDialogTemplate.html';

import declare from 'dojo/_base/declare';
import _WidgetBase from 'dijit/_WidgetBase';
import _TemplatedMixin from 'dijit/_TemplatedMixin';

export default declare([_WidgetBase, _TemplatedMixin], {
  templateString: template,
  maxWidth: 800,
  postCreate() {
    this.inherited(arguments);
    this.ownerDocumentBody.appendChild(this.domNode);
  },
  /**
   * Show a sticky modal and return the modal node
   * @return {*}
   */
  show() {
    jquery(this.domNode).modal({
      keyboard: false,
      backdrop: 'static',
    });
    jquery(this.domNode).modal('show');
    this._showing = true;
    return this.getModalBody();
  },
  getModalFooter() {
    return this._modalFooter;
  },
  getModalBody() {
    return this._modalBody;
  },
  hide() {
    this.clear();
    jquery(this.domNode).modal('hide');
  },
  clear() {
    m.render(this._modalBody, null);
    m.render(this._modalFooter, null);
  },
});
