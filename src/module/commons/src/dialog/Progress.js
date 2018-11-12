import _TemplatedMixin from 'dijit/_TemplatedMixin';
import _WidgetBase from 'dijit/_WidgetBase';
import declare from 'dojo/_base/declare';
import 'fuelux/js/loader';
import jquery from 'jquery';
import DOMUtil from '../util/htmlUtil';
import template from './ProgressTemplate.html';

export default declare([_WidgetBase, _TemplatedMixin], {
  templateString: template,
  progressDelay: 120,
  postCreate() {
    this.inherited('postCreate', arguments);
    this.ownerDocumentBody.appendChild(this.domNode);
    document.querySelector('#entryscape_dialogs').appendChild(this.domNode);
  },
  show(promise) {
    if (this.lock) {
      return;
    }
    this.lock = true;
    this.domNode.style.display = 'block';
    this.progress.innerHTML = '';
    const div = DOMUtil.create('div', null, this.progress);
    this._loader = DOMUtil.create('div', null, div);
    this._loader.classList.add('loader');
    jquery(this._loader).loader();
    // this.fadeIn = basefx.fadeIn({node: this.domNode});

    promise.then(this.hide.bind(this), this.hide.bind(this));

    this._timer = setTimeout(() => {
      // this.fadeIn.play();
      jquery(this.domNode).fadeTo(400, 1);
      delete this._timer;
    }, this.progressDelay);
  },
  hide() {
    if (this._timer) {
      clearTimeout(this._timer);
    }
    delete this.lock;
    // this.fadeIn.stop();
    jquery(this._loader).loader('destroy');
    this.domNode.style.display = 'none';
  },
});
