import m from 'mithril';

/**
 * @see ./Group.md
 */
export default {
  /**
   */
  view(vnode) {
    const { element = 'div', components, classNames = [] } = vnode.attrs;
    return m(element, { class: classNames.join(' ') }, [...components]);
  },
};
