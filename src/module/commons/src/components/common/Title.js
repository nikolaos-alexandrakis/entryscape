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
    classNames.push('float-right');
    return m('div', [
      m(hx, [
        button.text ? m(Button, button) : null,
        m.trust(`${title} ${small}`),
      ]),
      m('hr', { style: 'margin: 10px auto;' }),
    ]);
  },
};
