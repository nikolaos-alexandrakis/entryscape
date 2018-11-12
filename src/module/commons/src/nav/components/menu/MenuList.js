import m from 'mithril';
import MenuItem from './MenuItem';

export default {
  view(vnode) {
    const { items = [], selectedItem, onclick } = vnode.attrs;
    return m('ul.nav.side-menu', items.map(item => m(MenuItem, {
      item,
      onclick,
      selected: item.name === selectedItem,
    })));
  },
};
