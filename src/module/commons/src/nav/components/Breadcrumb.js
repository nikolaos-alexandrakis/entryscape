import m from 'mithril';

import BreadcrumbItem from './BreadcrumbItem';

const Breadcrumb = {
  view(vnode) {
    const { items } = vnode.attrs;
    return items.map(item => m(BreadcrumbItem, { item }));
  },
};

export default Breadcrumb;
