import { isFunction } from 'lodash-es';
import escoEntryType from 'commons/nls/escoEntryType.nls';
import { NLSMixin } from 'esi18n';
import declare from 'dojo/_base/declare';
import _WidgetBase from 'dijit/_WidgetBase';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import templateString from './EntryTypeTemplate.html';
import DOMUtil from '../util/htmlUtil';
import './escoEntryType.css';

export default declare([_WidgetBase, _TemplatedMixin, NLSMixin.Dijit], {
  // noinspection JSUnusedGlobalSymbols
  nlsBundles: [{ escoEntryType }],
  bid: 'escoEntryType',
  templateString,
  _i18nState: 1,
  __fileBlock: null,
  __linkBlock: null,
  __linkInput: null,
  __filePathInput: null,
  __filePathInputWrapper: null,
  __fileInputWrapper: null,
  __fileInput: null,

  postCreate() {
    this.inherited(arguments);
    this.__filePathInputWrapper.onclick = () => {
      this.__fileInput.click();
    };

    let t = null;
    const f = this.linkTyped.bind(this);
    this.__linkInput.onkeyup = () => {
      if (t) {
        clearTimeout(t);
      }
      t = setTimeout(f, 400);
    };
  },

  showConfig(conf) {
    this.show(conf.includeFile, conf.includeLink, conf.includeInternal);
  },

  /**
     *
     * @param includeFile
     * @param includeLink
     * @param includeInternal
     */
  show(includeFile, includeLink, includeInternal) {
    // DefaultValues
    const isIncludeFile = includeFile === true;
    const isIncludeLink = includeLink === true;
    const isIncludeInternal = includeInternal === true;

    if (!isIncludeFile && !isIncludeLink && !isIncludeInternal) {
      console.error('Cannot create entity that is nothing (not file, not link, not internal URI), '
          + 'something is wrong in the configuration');
    }

    this.newFileInputElement();

    this.domNode.classList.remove(`${this.bid}--linkLabelVisible`);
    this.domNode.classList.remove(`${this.bid}--fileLabelVisible`);
    this.domNode.classList.remove(`${this.bid}--internalLink`);

    const linkInputEl = this.domNode.querySelector('.escoEntryType__anyLinkInput');
    // No internal option allowed with link
    if (isIncludeLink && !isIncludeInternal) {
      linkInputEl.setAttribute('placeholder', this.NLSLocalized0.linkInputExternal_placeholder);
    } else {
      linkInputEl.setAttribute('placeholder', this.NLSLocalized0.linkInput_placeholder);
    }

    if (!isIncludeFile) { // No Filoption
      this.linkOption();
      this.noOption();
      this.domNode.classList.add(`${this.bid}--linkLabelVisible`);
    } else if (isIncludeFile && !isIncludeLink && !isIncludeInternal) { // No linkoption
      this.fileOption();
      this.noOption();
      this.domNode.classList.add(`${this.bid}--fileLabelVisible`);
    } else {
      this.linkOption();
    }

    // Only internal option, no link
    if (!isIncludeLink && isIncludeInternal) {
      this.domNode.classList.add(`${this.bid}--internalLink`);
    }

    this.updateErrorMessage(null);
    this.__linkInput.value = '';
    this.__filePathInput.value = '';
  },
  updateErrorMessage(message) {
    if (message === '' || message === null) {
      this.__errorMessage.style.display = 'none';
    } else {
      this.__errorMessage.style.display = '';
      this.__errorMessage.innerHTML = message;
    }
  },

  linkTyped() {
    const value = this.__linkInput.value;
    let inValid = false;
    if (isFunction(this.__linkInput.checkValidity)) {
      inValid = !this.__linkInput.checkValidity();
    } else {
      const re = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;
      inValid = value === '' ? false : value.match(re) === null; // Needs improvement
    }

    if (inValid) {
      this.updateErrorMessage(this.NLSLocalized0.linkNotValid);
    } else {
      this.updateErrorMessage(null);
    }

    if (this._i18nState === 2 && value === '') { // Empty value is not allowed, only real URI
      this.setValue(null, false);
    } else if (value === '') {
      this.setValue('', false);
    } else if (inValid === true) {
      this.setValue(null, false);
    } else {
      this.setValue(value, false);
    }
  },
  fileSelected() {
    const label = this.__fileInput.value.replace(/\\/g, '/').replace(/.*\//, '');
    // this.__filePathInput.setAttribute('value', label);
    this.__filePathInput.value = label;
    this.setValue(label === '' ? null : label, true);
  },
  noOption() {
    this.domNode.classList.remove(`${this.bid}--linkOption`);
    this.domNode.classList.remove(`${this.bid}--fileOption`);
  },
  linkOption() {
    this.__linkOptionLabel.classList.add('active');
    this.__fileOptionLabel.classList.remove('active');
    this.domNode.classList.add(`${this.bid}--linkOption`);
    this.domNode.classList.remove(`${this.bid}--fileOption`);
    this.__isFile = false;
    this.linkTyped();
    this.optionChange(false);
  },
  fileOption() {
    this.__linkOptionLabel.classList.add('active');
    this.__fileOptionLabel.classList.remove('active');
    this.domNode.classList.add(`${this.bid}--fileOption`);
    this.domNode.classList.remove(`${this.bid}--linkOption`);
    this.__isFile = true;
    this.updateErrorMessage(null);
    this.fileSelected();
    this.optionChange(true);
  },
  optionChange() {
    // Override or listen on this.
  },
  getValue() {
    return this.__value;
  },
  setLink(uri) {
    this.__linkInput.setAttribute('value', uri);
    this.setValue(uri, false);
  },
  setValue(value, isFile) {
    this.__isFile = isFile;
    this.__value = value;
    this.valueChange(value, isFile);
  },
  valueChange() {
    // Override or listen on this.
  },
  isFile() {
    return this.__isFile;
  },
  newFileInputElement() {
    if (this.__fileInput) {
      this.__fileInput.parentNode.removeChild(this.__fileInput);
      this.__fileInput.onchange = null;
    }
    this.__fileInput = DOMUtil.create('input',
      { type: 'file', name: `${this.id}_fileDialog` }, this.__fileInputWrapper);

    this.__fileInput.onchange = this.fileSelected.bind(this);
  },
  getFileInputElement() {
    return this.__fileInput;
  },
  newEntry(pe) {
    const context = pe.getContext();
    const graph = pe.getMetadata();
    if (this.isFile()) {
      const newpe = context.newEntry();
      // Just in case the inherited open method created a link with a default external URI.
      const uri1 = pe.getResourceURI();
      const uri2 = newpe.getResourceURI();
      if (uri1 !== uri2) {
        graph.replaceURI(uri1, uri2);
      }
      const inpEl = this.getFileInputElement();
      console.log(`input element is null ${inpEl == null}`);
      return newpe.setMetadata(graph).commit()
        .then((entry) => {
          if (inpEl.value) { // check if file was given
            return entry.getResource(true).putFile(inpEl).then(() => entry);
          }
          return entry; // Just make sure we return the entry.
        });
    }
    const uri = this.getValue();
    if (uri === '' || uri === null) {
      return pe.commit();
    }
    graph.replaceURI(pe.getResourceURI(), uri);
    return context.newLink(uri).setMetadata(graph).commit();
  },
});
