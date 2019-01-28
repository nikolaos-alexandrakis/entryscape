import m from 'mithril';
/**
 *
 * A box with a value and label (used for stats purposes mainly). Eg 25 terms, 2 collections)
 */

export default (vnode) => {
  return {
    view(vnode) {
      const { label, value, link } = vnode.attrs;
      return m('.col-md-6 escoOverview__statBox', [
        m('a', { href: link, tabindex: 0 }, [
          m('p', { class: 'escoOverview__statCount' }, value),
        ]),
        m('label', { class: 'escoOverview__statLabel' }, label),
      ]);
    },
  };
};

