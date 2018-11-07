import m from 'mithril';
import Button from './button/Button';

/**
 * @see ./Title.md
 */
const Title = {
  /**
  */
  view(vnode) {
    const { title, subtitle, hx, button = {} } = vnode.attrs;
    const small = subtitle ? `<small>${subtitle}</small>` : '';
    const { classNames = [] } = button;
    classNames.push('escoButton--inTitle');
    classNames.push('pull-right');
    return m('div', [
      m(hx, [
        button.text ? m(Button, button) : null,
        m.trust(`${title} ${small}`),
      ]),
      m('hr', { style: 'margin: 10px auto;' }),
    ]);
  },
};

export default Title;