import m from 'mithril';

/**
 * HTML: dt - dl
 */
export default {
  view(vnode) {
    return [
      m('div.flex-wrapper', [
        m('dt.catalog__status__label', vnode.attrs.label),
        m('dd.catalog__status__value', vnode.attrs.value),
      ]),
    ];
  },
};
