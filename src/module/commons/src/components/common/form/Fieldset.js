import m from 'mithril';
import Group from '../Group';

/**
 * @see ./Fieldset.md
 */
const Fieldset = {
  /**
   */
  view(vnode) {
    const {legend, components} = vnode.attrs;
    return m(Group, {element: 'fieldset', components: [m('legend', legend), ...components]});
  },
};

export default Fieldset;
