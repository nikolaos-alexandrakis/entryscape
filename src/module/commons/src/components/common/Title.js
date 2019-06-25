import m from 'mithril';
import Button from './button/Button';

/**
 * @see ./Title.md
 */
export default {
  view(vnode) {
    const { title, subtitle, hx, button = {} } = vnode.attrs;
    const small = subtitle ? `<small>${subtitle}</small>` : '';
    const { classNames = [] } = button;
    classNames.push('escoButton--inTitle');
    return m('div.d-flex.justify-content-between', [
      m(hx, m.trust(`${title} ${small}`)),
      button.text ? m(Button, button) : null,
    ]);
  },
};
