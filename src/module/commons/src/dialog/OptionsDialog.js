import jquery from 'jquery';
import declare from 'dojo/_base/declare';
import _WidgetBase from 'dijit/_WidgetBase';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import DOMUtil from '../util/htmlUtil';
import templateString from './OptionsDialogTemplate.html';

export default declare([_WidgetBase, _TemplatedMixin], {
  templateString,
  postCreate() {
    this.inherited('postCreate', arguments);
    this.ownerDocumentBody.appendChild(this.domNode);
    document.querySelector('#entryscape_dialogs').appendChild(this.domNode);

    jquery(this.domNode).on('hide.bs.modal', () => {
      if (this.lock !== true && this._deferred != null) {
        delete this._deferred;
        this.reject(false);
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
  show(message, options) {
    const that = this;
    this._deferred = new Promise((resolve, reject) => {
      that.resolve = resolve; // TODO bad! fix
      that.reject = reject; // TODO bad! fix
      const f = function () {
        this.buttonsFooter.innerHTML = '';
        this.message.innerHTML = message;
        options.forEach(this.installButton.bind(this));
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
  installButton(params) {
    let el;
    if (params.primary) {
      el = DOMUtil.create('button', {
        type: 'button',
      }, this.buttonsFooter);

      el.innerHTML = params.buttonLabel;
      el.classList.add('btn');
      el.classList.add('btn-primary');
    } else {
      el = DOMUtil.create('button', { type: 'button' }, this.buttonsFooter);
      el.classList.add('btn');
      el.classList.add('btn-secondary');
      el.innerHTML = params.buttonLabel;
    }

    el.onclick = function (ev) {
      ev.stopPropagation();
      this.lock = true;
      jquery(this.domNode).modal('hide');
      delete this._deferred;
      this.resolve(params.name);
      this.lock = false;
    }.bind(this);
  },
});
