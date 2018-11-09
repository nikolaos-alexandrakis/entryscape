import _WidgetBase from 'dijit/_WidgetBase';
import declare from 'dojo/_base/declare';
import { i18n } from 'esi18n';
import DOMUtil from '../util/htmlUtil';

const defaultPadding = '20px';
export default declare([_WidgetBase], {
  path: '',
  localized: false,
  padding: true,

  buildRendering() {
    this.domNode = DOMUtil.create('div', { class: 'textView' });
  },

  show(params) {
    const path = params.path || this.path;
    if (this.padding !== '') {
      if (this.padding === true) {
        this.domNode.style.padding = defaultPadding;
      } else if (typeof this.padding === 'string') {
        this.domNode.style.padding = this.padding;
      }
    }
    if (this.localized) {
      const language = i18n.getLocale();
      import(`${path}_${language}.html`).then((text) => {
        this.domNode.innerHTML = text;
      }, () => {
        import(`${path}.html`).then((text) => {
          this.domNode.innerHTML = text;
        });
      });
    } else {
      require([`dojo/text!${path}.html`], (text) => {
        this.domNode.innerHTML = text;
      });
    }
  },
});
