import jquery from 'jquery';
import { NLSMixin } from 'esi18n';
import declare from 'dojo/_base/declare';
import _WidgetBase from 'dijit/_WidgetBase';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import escoDialogs from 'commons/nls/escoDialogs.nls';
import template from './AcknowledgeDialogTemplate.html';

export default declare([_WidgetBase, _TemplatedMixin, NLSMixin.Dijit], {
  templateString: template,
  nlsBundles: [{ escoDialogs }],
  postCreate() {
    this.inherited('postCreate', arguments);
    this.ownerDocumentBody.appendChild(this.domNode);

    // TODO
    // After the transition from dojo.Deferred to Promise we forgot to take into account that the interface of those two
    // are quite different. When using Promise we need to keep the original resolve/reject functions created on Promise
    // creation if we don't resolve/reject inside the body of the Promise. In order to resolve/reject outside the body
    // of the promise (...and because all the dialogs need to be re-written) we keep a reference to the resolve/reject
    // created
    this._resolve = null;
    this._reject = null;

    const entryscapeDialogsEl = document.querySelector('#entryscape_dialogs');
    entryscapeDialogsEl.appendChild(this.domNode);

    jquery(this.domNode).on('hide.bs.modal', () => {
      if (this.lock !== true && this._deferred != null) {
        delete this._deferred;
        this._resolve();
      }
    });
    jquery(this.domNode).on('hidden.bs.modal', () => {
      this._showing = false;
      if (this._showFunc) {
        this._showFunc();
        delete this._showFunc;
      }
    });
  },
  show(message, okLabel, callback) {
    this._deferred = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;

      if (callback) {
        this._deferred.then(callback); // TODO no need for a callback, just use thenable part of the promise
      }
      const f = function () {
        // domAttr.set(this.okLabelNode, 'innerHTML', okLabel || this.NLSBundle0.ok);
        this.okLabelNode.innerHTML = okLabel || this.NLSBundle0.ok;
        // domAttr.set(this.acknowledgeMessage, 'innerHTML', message);
        this.acknowledgeMessage.innerHTML = message;
        jquery(this.domNode).modal('show');
        this._showing = true;
      };
      if (this._showing) {
        this._showFunc = f;
      } else {
        f.apply(this);
      }
    });

    return this._deferred;
  },
  acknowledge() {
    this.lock = true;
    jquery(this.domNode).modal('hide');
    delete this._deferred;
    this._resolve();
    this.lock = false;
  },
});
