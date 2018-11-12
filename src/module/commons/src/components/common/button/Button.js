import m from 'mithril';
import './escoButton.css';

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
      element = 'button',
      inner = 'span',
      href,
      target,
      externalLink = false,
      text,
      popover,
      onclick,
      icon,
      disabled = false,
      classNames = [],
    } = vnode.attrs;
    classNames.push(this.bid);
    if (externalLink) {
      classNames.push('spaExplicitLink');
    }
    return m(`${element}.btn`,
      { title: popover, class: classNames.join(' '), onclick, disabled, href, target }, [
        m(inner, text),
        icon ? m('i', { class: ['fa', icon].join(' ') }) : null,
      ]);
  },
};
