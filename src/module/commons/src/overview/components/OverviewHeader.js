import m from 'mithril';

const OverviewHeader = {
  view(vnode) {
    return m('.page-header', [
      m('h2', vnode.attrs.title),
      m('p', { class: 'escoOverview__description' }, vnode.attrs.description),
    ]);
  },
};

export { OverviewHeader };
export default OverviewHeader;
