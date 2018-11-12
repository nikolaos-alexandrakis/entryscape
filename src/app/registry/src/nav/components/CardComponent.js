import m from 'mithril';

export default {
  view(vnode) {
    const {
      id,
      title,
      text,
      faClass,
      onclick,
    } = vnode.attrs;

    return m('div.col-xs-12.col-md-6', { style: 'padding: 0 7.5px' }, [
      m(`.col-xs-12 ${id}__card panel`, { onclick }, [
        m('i', { class: `${id}__cardIcon pull-right fa fa-2x fa-${faClass}` }, null),
        m('h3', { class: `${id}__cardHeader` }, title),
        m('p', { class: `${id}__cardParagraph` }, text),
      ]),
    ]);
  },
};
