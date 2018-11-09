import m from 'mithril';
import BreadcrumbItem from './BreadcrumbItem';

export default {
  view(vnode) {
    const { items } = vnode.attrs;
    return items.map(item => m(BreadcrumbItem, { item }));
  },
};
