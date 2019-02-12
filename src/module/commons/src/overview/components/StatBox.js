import m from 'mithril';
/**
 *
 * A box with a value and label (used for stats purposes mainly). Eg 25 terms, 2 collections)
 */
export default {
  view(vnode) {
    return m('.row', vnode.attrs.bList.map((item) => {
      const { label, value, link } = item;
      return m('a.col-md-6 escoOverview__statBox',{ href: link },[
          m('p', { class: 'escoOverview__statCount' }, value),
          m('label', { class: 'escoOverview__statLabel' }, label),
      ]);
    }));
  },
};
