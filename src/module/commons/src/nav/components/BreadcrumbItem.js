import m from 'mithril';

const BreadcrumbItem = {
  view(vnode) {
    const { value, className, href } = vnode.attrs.item;

    return m('li', { className, key: value }, [
      href ? m('a', { href }, value) : m('span', { title: value }, value),
    ]);
  },
};

export default BreadcrumbItem;
