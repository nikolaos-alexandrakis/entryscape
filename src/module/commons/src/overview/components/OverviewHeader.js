import m from 'mithril';

export default {
  view(vnode) {
    return m('.page-header', [
      m('h2', vnode.attrs.title),
      m('p', { class: 'escoOverview__description' }, vnode.attrs.description),
    ]);
  },
};
