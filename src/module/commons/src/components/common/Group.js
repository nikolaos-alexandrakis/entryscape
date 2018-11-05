import m from 'mithril';

/**
 * @see ./Group.md
 */
const Group = {
  /**
   */
  view(vnode) {
    const {element = 'div', components, classNames = []} = vnode.attrs;
    return m(element, {class: classNames.join(' ')}, [...components]);
  },
};

export default Group;
