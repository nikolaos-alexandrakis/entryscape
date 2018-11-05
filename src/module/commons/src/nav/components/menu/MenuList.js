import m from 'mithril';

import MenuItem from './MenuItem';

const MenuList = {
  view(vnode) {
    const { items = [], selectedItem, onclick } = vnode.attrs;
    return m('ul.nav.side-menu', items.map(item => m(MenuItem, {
      item,
      onclick,
      selected: item.name === selectedItem,
    })));
  },
};

export default MenuList;
