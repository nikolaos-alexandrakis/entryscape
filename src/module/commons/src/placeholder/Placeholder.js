import { i18n, NLSMixin } from 'esi18n';
import escoPlaceholder from 'commons/nls/escoPlaceholder.nls';
import declare from 'dojo/_base/declare';
import _WidgetBase from 'dijit/_WidgetBase';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import template from './PlaceholderTemplate.html';
import './escoPlaceholder.css';

export default declare([_WidgetBase, _TemplatedMixin, NLSMixin.Dijit], {
  templateString: template,
  missingImageClass: 'question',
  searchImageClass: 'search',
  nlsBundles: [{ escoPlaceholder }],
  bid: 'escoPlaceholder',
  placeholderText: '',
  searchMode: false,
  includeCreateButton: false,

  show(searchMode) {
    this.domNode.style.display = 'block';
    this.render(searchMode);
  },
  hide() {
    this.domNode.style.display = 'none';
  },
  render(searchMode) {
    this.searchMode = searchMode;
    if (searchMode) {
      this.setImageClass(this.searchImageClass);
    } else {
      this.setImageClass(this.missingImageClass);
    }
    if (this.includeCreateButton) {
      this.__placeholderButton.style.display = 'flex';
    }
    if (this.NLSBundle0) {
      this.localeChange();
    }
  },
  localeChange() {
    const text = this.getText();
    let nlsObj = this.getNlsForCButton();
    if (text) {
      this.setText(text);
      this.setNlsForCButton(nlsObj);
    } else if (this.searchMode) {
      this.setText(this.NLSBundle0.emptySearchMessage);
      this.setNlsForCButton({});
    } else {
      const name = this.getName();
      if (name) {
        nlsObj = [];
        this.setText(i18n.renderNLSTemplate(this.NLSBundle0.emptyMessageWithName, { 1: name }));
        const buttonLabel = i18n.renderNLSTemplate(
          this.NLSBundle0.createButtonWithName,
          { 1: name },
        );
        const buttonTitle = i18n.renderNLSTemplate(
          this.NLSBundle0.createButtonTitleWithName,
          { 1: name },
        );
        nlsObj.nlsKey = buttonLabel;
        nlsObj.nlsKeyTitle = buttonTitle;
        this.setNlsForCButton(nlsObj);
      } else {
        this.setText(this.NLSBundle0.emptyMessage);
      }
    }
  },
  getText() {
    if (this.placeholderText && this.placeholderText !== '') {
      return this.placeholderText;
    }
    return '';
  },
  getNlsForCButton() {
    return {};
  },
  getName() {
  },
  setImageClass(cls) {
    this.__placeholderImage.removeAttribute('class');
    this.__placeholderImage.classList.add('fa');
    this.__placeholderImage.classList.add('fa-5x');
    this.__placeholderImage.classList.add('mx-auto');
    this.__placeholderImage.classList.add(`fa-${cls}`);
  },
  setText(text) { // pass localized message
    this.__placeholdertxt.innerHTML = text;
  },
  setNlsForCButton(nlsObj) {
    // {nlsKey: this.nlsCreateEntryLabel,nlsKeyTitle: this.nlsCreateEntryTitle, }
    if (Object.keys(nlsObj).length === 0) {
      this.__placeholderButton.style.display = 'none';
    } else {
      this.__placeholderCButton.innerHTML = ` ${nlsObj.nlsKey}`;
      this.__placeholderCButton.setAttribute('title', nlsObj.nlsKeyTitle);
    }
  },
  createAction() {
  },
});
