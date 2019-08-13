import m from 'mithril';

/**
 * @see ./Help.md
 */
export default {
  /**
   */
  view(vnode) {
    const { text, classNames = [] } = vnode.attrs.help;
    return m('p.form-text', { role: 'alert', class: classNames.join(' ') }, text);
  },
};
