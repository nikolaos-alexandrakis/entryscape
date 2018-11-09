import jquery from 'jquery';
import escoDialogs from 'commons/nls/escoDialogs.nls';
import { NLSMixin } from 'esi18n';
import declare from 'dojo/_base/declare';
import _WidgetBase from 'dijit/_WidgetBase';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import templateString from './ConfirmDialogTemplate.html';

export default declare([_WidgetBase, _TemplatedMixin, NLSMixin.Dijit], {
  templateString,
  nlsBundles: [{ escoDialogs }],
  postCreate() {
    this.inherited('postCreate', arguments);

    // TODO
    // After the transition from dojo.Deferred to Promise we forgot to take into account that the interface of those two
    // are quite different. When using Promise we need to keep the original resolve/reject functions created on Promise
    // creation if we don't resolve/reject inside the body of the Promise. In order to resolve/reject outside the body
    // of the promise (...and because all the dialogs need to be re-written) we keep a reference to the resolve/reject
    // created
    this._resolve = null;
    this._reject = null;

    this.ownerDocumentBody.appendChild(this.domNode);

    const entryscapeDialogsEl = document.querySelector('#entryscape_dialogs');
    if (entryscapeDialogsEl) {
      entryscapeDialogsEl.appendChild(this.domNode);
    }

    jquery(this.domNode).on('hide.bs.modal', () => {
      if (this.lock !== true && this._deferred != null) {
        delete this._deferred; // TODO needs to be deleted?
        this._reject(false);
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
  show(message, confirmLabel, rejectLabel, callback) {
    this._deferred = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;

      const f = function () {
        this.confirmLabelNode.innerHTML = confirmLabel || this.NLSBundle0.confirm;
        this.rejectLabelNode.innerHTML = rejectLabel || this.NLSBundle0.reject;
        this.confirmMessage.innerHTML = message;
        jquery(this.domNode).modal('show');
        this._showing = true;
      };
      if (this._showing) {
        this._showFunc = f;
      } else {
        f.apply(this);
      }
    });

    if (callback) {
      this._deferred.then(callback, callback);
    }

    return this._deferred;
  },
  reject() {
    this.lock = true;
    jquery(this.domNode).modal('hide');
    this._reject(false);
    delete this._deferred; // TODO do we really need to delete this?
    this.lock = false;
  },
  confirm() {
    this.lock = true;
    jquery(this.domNode).modal('hide');
    this._resolve(true);
    delete this._deferred;
    this.lock = false;
  },
});
