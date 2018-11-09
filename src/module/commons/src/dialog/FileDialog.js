import _TemplatedMixin from 'dijit/_TemplatedMixin';
import _WidgetBase from 'dijit/_WidgetBase';
import declare from 'dojo/_base/declare';
import jquery from 'jquery';
import template from './FileDialogTemplate.html';

export default declare([_WidgetBase, _TemplatedMixin], {
  templateString: template,
  validFile: false,
  postCreate() {
    this.inherited('postCreate', arguments);
    this.ownerDocumentBody.appendChild(this.domNode);

    const entryscapeDialogsEl = document.querySelector('#entryscape_dialogs');
    entryscapeDialogsEl.appendChild(this.domNode);

    jquery(this.domNode).on('hide.bs.modal', () => {
      if (this.lock !== true && this._confirmCallback != null) {
        this._confirmCallback(false);
        delete this._confirmCallback;
      }
    });
    this.fileInput.onchange = this.fileSelected.bind(this);
  },
  clear() {
    this.uploadNode.setAttribute('disabled', true);
    this.selectedFile.setAttribute('value', '');
    this.validFile = false;
  },
  fileSelected() {
    this.numFiles = this.fileInput.files ? this.fileInput.files.length : 1;
    this.label = this.fileInput.value.replace(/\\/g, '/').replace(/.*\//, '');
    this.validFile = true;
    this.uploadNode.setAttribute('disabled', false);
    this.selectedFile.setAttribute('value', this.label);
  },
  show(message, uploadLabel, cancelLabel, callback) {
    this._uploadCallback = callback;
    this.clear();
    this.unlockUpload(); // Just to be sure.
    this.uploadLabelNode.innerHTML = (uploadLabel || 'Upload');
    this.cancelLabelNode.innerHTML = (cancelLabel || 'Cancel');
    jquery(this.domNode).modal('show');
  },
  cancel() {
    if (this.lock) {
      return;
    }
    this.clear();
    this.unlockUpload();
    jquery(this.domNode).modal('hide');
    delete this._uploadCallback;
  },
  unlockUpload() {
    this.lock = false;
    this.spinner.style.display = 'none';
    this.uploadNode.setAttribute('disabled', false);
    this.cancelLabelNode.setAttribute('disabled', false);
    this.messageNode.innerHTML = '';
    jquery(this.domNode).modal('hide');
  },
  upload() {
    if (!this.validFile || this.lock) {
      return;
    }
    const unlock = this.unlockUpload.bind(this);
    this.lock = true;
    this.spinner.style.display = '';
    this.uploadNode.setAttribute('disabled', true);
    this.cancelLabelNode.setAttribute('disabled', true);
    this._uploadCallback(this.fileInput, this.label).then(() => {
      unlock();
    }, function (errMessage) {
      unlock();
      if (typeof errMessage === 'string') {
        this.messageNode.innerHTML = errMessage;
      }
    });
    delete this._uploadCallback;
  },
});
