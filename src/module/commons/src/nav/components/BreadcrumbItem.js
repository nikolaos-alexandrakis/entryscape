import m from 'mithril';

export default {
  view(vnode) {
    const { value, className, href } = vnode.attrs.item;

    return m('li', { className, className + 'breadcrumb-item', key: value }, [
      href ? m('a', { href }, value) : m('span', { title: value }, value),
    ]);
  },
};
