import m from 'mithril';

const FullLogo = {
  view(vnode) {
    const { src: { full } } = vnode.attrs;
    return m('.logo-text.full.hidden-xs.hidden-sm', [m('img', { src: full, alt: 'Logo image' })]);
  },
};

export default FullLogo;
