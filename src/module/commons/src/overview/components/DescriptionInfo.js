import m from 'mithril';

/**
 * HTML: dt - dl
 */
export default {
  view(vnode) {
    return [
      m('dt', vnode.attrs.label),
      m('dd', vnode.attrs.value),
    ];
  },
};
