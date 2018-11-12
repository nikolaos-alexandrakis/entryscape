import m from 'mithril';
import Input from './Input';

/**
 * https://www.w3schools.com/bootstrap/bootstrap_ref_css_buttons.asp
 * element : HTML element to use for button
 * type : btn-?
 * text : text in button
 * className : a single class name TODO make array
 * onclick : function
 *
 * @type {{view: ((vnode))}}
 */
export default {
  bid: 'escoButton',
  view(vnode) {
    const {
      type = 'togglebutton',
      label,
      input,
      disabled,
    } = vnode.attrs;

    const attrs = disabled ? { disabled } : {};
    return m(`div.${type}`, attrs, [
      m('label', [
        m(Input, { input }),
        m('span', label),
      ]),
    ]);
  },
};

