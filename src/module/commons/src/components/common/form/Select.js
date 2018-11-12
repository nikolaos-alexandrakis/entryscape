import m from 'mithril';

export default {
  view(vnode) {
    const {
      name,
      id,
      placeholder = undefined,
      required = true,
      disabled = false,
      readonly = false,
      autocomplete,
      onchange,
      value = null,
      classNames = ['form-control'],
      options,
    } = vnode.attrs;

    const attrs = {
      id,
      name,
      class: classNames.join(' '),
      onchange,
      value,
      required,
      disabled,
      readonly,
      placeholder,
      autocomplete,
    };
    return m('select', attrs, options.map(o => m('option', o, o.label)));
  },
};
