import m from 'mithril';
import Input from './Input';

/**
 */
export default {
  view(vnode) {
    const { name, id, label, checked, input = { type: 'radio' }, onclick, classNames = ['radio-inline'] } = vnode.attrs;

    input.id = `${id}Input${label}`;
    input.name = `${name}Input`;
    input.classNames = [];
    input.required = false;
    input.checked = checked;

    return m('label', { id, name, onclick, 'data-recipe': label, class: classNames.join(' '), style: 'width: 80px;' }, [
      m(Input, { input }),
      m('span', { innerHTML: label, style: 'padding-left: 20px; top: 0;' }),
    ]);
  },
};

// TODO for some reason the fezvrasta radio inline doesn't work well so we need to have
// inline css
