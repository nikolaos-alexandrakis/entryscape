export default CollectionItem = {
  view(vnode) {
    const { bid, id, title, size, active, href } = vnode.attrs;
    const activeCss = active ? 'active' : '';

    return m(`li.${bid}__listItem[role="presentation"].${activeCss}`, { key: id },
      m('a', { href },
        [
          m('span.badge.float-right', size),
          m(`span.${bid}_entityName`, m.trust(title)),
        ]));
  },
};
