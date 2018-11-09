import m from 'mithril';

/**
 * @type {{view: ((vnode))}}
 */
export default {
  enabled: true,
  view(vnode) {
    const {
      id,
      oninput,
      onchange,
      onsubmit = 'return false;',
      classNames = [],
    } = vnode.attrs;

    return m('form', { id, onsubmit, oninput, onchange, class: classNames.join(' ') }, vnode.children);
  },
};
