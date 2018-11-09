import m from 'mithril';

export default {
  view(vnode) {
    const { item: { name, label, href, icon }, onclick, selected } = vnode.attrs;

    const attrs = Object.assign({
      key: name,
      onclick: m.withAttr('data-module', onclick),
      'data-module': name,
    }, selected ? { class: 'active' } : {});

    return m('li', attrs,
      [
        m('a', Object.assign({ href }, selected ? { class: 'selected' } : {}), [
          m(`i.fa.fa-${icon}`),
          m('span.menu-title', label),
        ]),
      ],
    );
  },
};
