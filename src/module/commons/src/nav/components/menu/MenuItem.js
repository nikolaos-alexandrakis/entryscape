import m from 'mithril';
import { isExternalLink } from 'commons/util/util';

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
          m(`i.fas.fa-${icon}`),
          m('span.menu-title', label),
          isExternalLink(href) ? m('span.fas.fa-external-link-alt') : null,
        ]),
      ],
    );
  },
};
