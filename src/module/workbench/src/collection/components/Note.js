const listStyle = 'list-style: none;padding-left:0';

export default Note = {
  view(vnode) {
    const {text, addLabel, removeLabel, onClose} = vnode.attrs;
    return m('.alert.alert-info.alert-dismissable', [
      m('a.close[aria-label="close][data-dismiss="alert"][href="#"]', {onclick: onClose}, '×'),
      m('.note', {style: 'margin-bottom: 10px'}, text),
      m('ul', {style: listStyle}, [
        m('li', [
          m('span', {className: 'fa fa-fw fa-check'}),
          m('span', addLabel),
        ]),
        m('li', [
          m('span', {className: 'fa fa-fw fa-remove'}),
          m('span', removeLabel),
        ]),
      ])]);
  },
};
