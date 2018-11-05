import m from 'mithril';

/**
 * @see ./Help.md
 */
const Help = {
  /**
   */
  view(vnode) {
    const {text, classNames = []} = vnode.attrs.help;
    return m('p.help-block', {role: 'alert', class: classNames.join(' ')}, text);
  },
};

export default Help;
