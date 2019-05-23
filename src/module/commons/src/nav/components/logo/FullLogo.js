import m from 'mithril';


export default {
  view(vnode) {
    const { src: { full } } = vnode.attrs;
    return m('.logo-text.full.d-none.d-sm-none', [m('img', { src: full, alt: 'Logo image' })]);
  },
};
